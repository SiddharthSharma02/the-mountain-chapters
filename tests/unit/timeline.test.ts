import { describe, expect, it } from "vitest";
import { normalizeStay } from "@/lib/stays/normalize";
import { buildStayTimeline, type TimelineBlock } from "@/lib/stays/timeline";
import { stateA, stateB, stateC } from "../fixtures/stays";

const kinds = (blocks: TimelineBlock[]) => blocks.map((b) => b.kind);

describe("buildStayTimeline — shared guarantees", () => {
  for (const [label, raw] of [["A", stateA], ["B", stateB], ["C", stateC]] as const) {
    it(`State ${label}: always ends with the booking block`, () => {
      const blocks = buildStayTimeline(normalizeStay(raw));
      expect(blocks.at(-1)?.kind).toBe("book");
    });

    it(`State ${label}: every block has a unique key`, () => {
      const blocks = buildStayTimeline(normalizeStay(raw));
      const keys = blocks.map((b) => b.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it(`State ${label}: appended tail sections keep the documented order`, () => {
      const order = ["rooms", "amenities", "location", "reviews", "rules", "faq", "book"];
      // Admin-authored sections ("section-*") may deliberately place e.g. amenities earlier.
      const tail = buildStayTimeline(normalizeStay(raw))
        .filter((b) => !b.key.startsWith("section-"))
        .map((b) => b.kind)
        .filter((k) => order.includes(k));
      const positions = tail.map((k) => order.indexOf(k));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });
  }
});

describe("buildStayTimeline — State A (legacy)", () => {
  const stay = normalizeStay(stateA);
  const blocks = buildStayTimeline(stay);

  it("auto-builds a story from gallery images without reusing the hero image", () => {
    const images = blocks.filter((b) => b.kind === "image");
    expect(images.length).toBeGreaterThan(0);
    for (const b of images) {
      if (b.kind === "image") expect(b.imageUrl).not.toBe(stay.heroImage);
    }
  });

  it("never invents captions for auto-generated image blocks", () => {
    for (const b of blocks) {
      if (b.kind === "image") {
        expect(b.title).toBeNull();
        expect(b.body).toBeNull();
      }
    }
  });

  it("places the description as a story block", () => {
    const story = blocks.find((b) => b.kind === "story");
    expect(story && story.kind === "story" && story.body).toBe(stateA.description);
  });

  it("shows a rooms block with the legacy fallback price and no rooms", () => {
    const rooms = blocks.find((b) => b.kind === "rooms");
    expect(rooms).toBeDefined();
    if (rooms?.kind === "rooms") {
      expect(rooms.rooms).toEqual([]);
      expect(rooms.fallbackPrice).toBe(4500);
    }
  });

  it("shows amenities converted from the legacy array", () => {
    expect(kinds(blocks)).toContain("amenities");
  });

  it("shows the legacy rating summary but no individual reviews", () => {
    const reviews = blocks.find((b) => b.kind === "reviews");
    expect(reviews?.kind === "reviews" && reviews.reviews).toEqual([]);
    expect(reviews?.kind === "reviews" && reviews.summary.source).toBe("legacy");
  });

  it("omits rules, FAQ and location blocks when there is no data for them", () => {
    // Legacy address alone is enough for a location block; everything else is absent.
    expect(kinds(blocks)).not.toContain("rules");
    expect(kinds(blocks)).not.toContain("faq");
  });

  it("omits the reviews block when there is neither review data nor a legacy rating", () => {
    const s = normalizeStay({ ...stateA, rating: 0, review_count: 0 });
    expect(kinds(buildStayTimeline(s))).not.toContain("reviews");
  });

  it("omits the location block when there is no address, coordinates or nearby places", () => {
    const s = normalizeStay({ ...stateA, address: null });
    expect(kinds(buildStayTimeline(s))).not.toContain("location");
  });
});

describe("buildStayTimeline — State B (rooms, no story)", () => {
  const stay = normalizeStay(stateB);
  const blocks = buildStayTimeline(stay);

  it("interleaves guest reviews between property images", () => {
    const k = kinds(blocks);
    const firstReview = k.indexOf("review");
    expect(firstReview).toBeGreaterThan(0);
    expect(k.slice(0, firstReview)).toContain("image");
    expect(k.slice(firstReview + 1)).toContain("image");
  });

  it("never stacks auto reviews back-to-back when there are no photos to separate them", () => {
    const onlyHero = normalizeStay({ ...stateB, stay_images: [stateB.stay_images[1]] });
    const k = kinds(buildStayTimeline(onlyHero));
    expect(k.filter((x) => x === "review")).toHaveLength(1);
  });

  it("puts highlighted reviews first in the interleave", () => {
    const first = blocks.find((b) => b.kind === "review");
    expect(first?.kind === "review" && first.review.reviewer_name).toBe("Guest 2");
  });

  it("lists every active room in the rooms block in admin order", () => {
    const rooms = blocks.find((b) => b.kind === "rooms");
    expect(rooms?.kind === "rooms" && rooms.rooms.map((r) => r.slug)).toEqual([
      "forest-view-suite",
      "deluxe-mountain-room",
    ]);
  });

  it("computes the review summary from actual reviews, not the legacy numbers", () => {
    const reviews = blocks.find((b) => b.kind === "reviews");
    if (reviews?.kind !== "reviews") throw new Error("missing reviews block");
    expect(reviews.summary.source).toBe("reviews");
    expect(reviews.summary.count).toBe(2);
    expect(reviews.summary.average).toBe(4.5);
  });
});

describe("buildStayTimeline — State C (admin-authored story)", () => {
  const stay = normalizeStay(stateC);
  const blocks = buildStayTimeline(stay);

  it("follows the admin's section order exactly", () => {
    expect(kinds(blocks).slice(0, 4)).toEqual(["image", "review", "room", "amenities"]);
  });

  it("keeps admin captions on image sections", () => {
    const first = blocks[0];
    expect(first.kind === "image" && first.title).toBe("Wake up above the clouds");
  });

  it("skips review sections whose review is missing or inactive", () => {
    const reviewBlocks = blocks.filter((b) => b.kind === "review");
    expect(reviewBlocks).toHaveLength(1);
  });

  it("skips room sections whose room is missing or inactive", () => {
    const roomBlocks = blocks.filter((b) => b.kind === "room");
    expect(roomBlocks).toHaveLength(1);
    expect(roomBlocks[0].kind === "room" && roomBlocks[0].room.slug).toBe("deluxe-mountain-room");
  });

  it("skips image sections without an image", () => {
    expect(blocks.some((b) => b.kind === "image" && b.title === "No picture")).toBe(false);
  });

  it("does not repeat a room already featured in the story inside the rooms block", () => {
    const rooms = blocks.find((b) => b.kind === "rooms");
    expect(rooms?.kind === "rooms" && rooms.rooms.map((r) => r.slug)).toEqual(["forest-view-suite"]);
  });

  it("does not repeat amenities when the story already placed them", () => {
    expect(kinds(blocks).filter((k) => k === "amenities")).toHaveLength(1);
  });

  it("renders quote sections", () => {
    const quote = blocks.find((b) => b.kind === "quote");
    expect(quote?.kind === "quote" && quote.text).toBe("Evenings around the fire.");
  });

  it("includes location, rules and FAQ for a fully built stay", () => {
    expect(kinds(blocks)).toEqual(expect.arrayContaining(["location", "rules", "faq"]));
  });

  it("omits the rooms block when every room is already featured in the story", () => {
    const allPlaced = normalizeStay({
      ...stateC,
      stay_sections: [
        ...stateC.stay_sections,
        { ...stateC.stay_sections[2], id: "00000000-0000-4000-8000-000000000999", room_id: "00000000-0000-4000-8000-000000000102", sort_order: 20 },
      ],
    });
    expect(kinds(buildStayTimeline(allPlaced))).not.toContain("rooms");
  });
});

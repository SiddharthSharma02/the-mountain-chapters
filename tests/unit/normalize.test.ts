import { describe, expect, it } from "vitest";
import { normalizeStay } from "@/lib/stays/normalize";
import { stateA, stateB, stateC } from "../fixtures/stays";

describe("normalizeStay — State A (legacy stay, no relational data)", () => {
  const stay = normalizeStay(stateA);

  it("renders the legacy images[] as the gallery, skipping blank URLs", () => {
    expect(stay.gallery.map((g) => g.url)).toEqual([
      stateA.images[0],
      stateA.images[2],
      stateA.images[3],
    ]);
  });

  it("gives legacy gallery entries stable, unique ids", () => {
    const keys = stay.gallery.map((g) => g.id);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("converts legacy amenities[] into structured amenities, trimmed and non-empty", () => {
    expect(stay.amenities.map((a) => a.name)).toEqual([
      "WiFi",
      "Bonfire",
      "Mountain View",
      "Breakfast Included",
    ]);
  });

  it("categorises legacy amenities against the catalog, ignoring case and punctuation", () => {
    const byName = Object.fromEntries(stay.amenities.map((a) => [a.name, a.category]));
    expect(byName["WiFi"]).toBe("Essentials"); // catalog spells it "Wi-Fi"
    expect(byName["Bonfire"]).toBe("Outdoor");
    expect(byName["Mountain View"]).toBe("Outdoor");
    expect(byName["Breakfast Included"]).toBe("Other");
  });

  it("uses cover_image as the hero image", () => {
    expect(stay.heroImage).toBe(stateA.cover_image);
  });

  it("keeps the legacy fallback price and rating", () => {
    expect(stay.price_per_night).toBe(4500);
    expect(stay.rating).toBe(4.8);
    expect(stay.review_count).toBe(126);
  });

  it("has empty relational collections and null policies without crashing", () => {
    expect(stay.rooms).toEqual([]);
    expect(stay.reviews).toEqual([]);
    expect(stay.sections).toEqual([]);
    expect(stay.faqs).toEqual([]);
    expect(stay.nearby).toEqual([]);
    expect(stay.policies).toBeNull();
  });

  it("tolerates missing child arrays entirely (e.g. before the migration is applied)", () => {
    const bare = { ...stateA } as Record<string, unknown>;
    for (const k of ["stay_images", "stay_amenities", "stay_sections", "rooms", "stay_reviews", "stay_faqs", "stay_policies", "stay_nearby_places"]) {
      delete bare[k];
    }
    const s = normalizeStay(bare as never);
    expect(s.gallery).toHaveLength(3);
    expect(s.rooms).toEqual([]);
  });
});

describe("normalizeStay — State B (relational data)", () => {
  const stay = normalizeStay(stateB);

  it("prefers stay_images over legacy images[], ordered by sort_order", () => {
    expect(stay.gallery.map((g) => g.url)).toEqual([
      stateB.stay_images[1].image_url,
      stateB.stay_images[0].image_url,
      stateB.stay_images[2].image_url,
      stateB.stay_images[3].image_url,
    ]);
  });

  it("prefers stay_amenities over legacy amenities[]", () => {
    expect(stay.amenities.map((a) => a.name)).toEqual(["Wi-Fi", "Bonfire"]);
  });

  it("drops inactive rooms and orders active rooms by sort_order", () => {
    expect(stay.rooms.map((r) => r.slug)).toEqual(["forest-view-suite", "deluxe-mountain-room"]);
  });

  it("orders room images by sort_order so the first is the primary image", () => {
    const deluxe = stay.rooms.find((r) => r.slug === "deluxe-mountain-room")!;
    expect(deluxe.room_images.map((i) => i.image_type)).toEqual(["room", "bathroom"]);
  });

  it("drops inactive rate plans", () => {
    const deluxe = stay.rooms.find((r) => r.slug === "deluxe-mountain-room")!;
    expect(deluxe.room_rate_plans.map((p) => p.name)).toEqual(["Room only"]);
  });

  it("drops inactive reviews", () => {
    expect(stay.reviews.map((r) => r.reviewer_name)).toEqual(["Guest 1", "Guest 2"]);
  });

  it("can include inactive children for the admin builder", () => {
    const admin = normalizeStay(stateB, { includeInactive: true });
    expect(admin.rooms).toHaveLength(3);
    expect(admin.reviews).toHaveLength(3);
  });
});

describe("normalizeStay — State C", () => {
  const stay = normalizeStay(stateC);

  it("unwraps stay_policies whether PostgREST returns an array or an object", () => {
    expect(stay.policies?.pets).toBe("Allowed");
    const asObject = normalizeStay({ ...stateC, stay_policies: (stateC.stay_policies as never[])[0] });
    expect(asObject.policies?.pets).toBe("Allowed");
  });

  it("drops inactive sections and orders the rest", () => {
    expect(stay.sections.map((s) => s.sort_order)).toEqual([0, 1, 2, 4, 5, 6, 7, 8]);
  });

  it("orders FAQs and nearby places", () => {
    expect(stay.faqs[0].question).toBe("Do you allow pets?");
    expect(stay.nearby.map((n) => n.name)).toEqual(["Shimla Mall Road", "Shimla Railway Station"]);
  });

  it("carries coordinates through as numbers", () => {
    expect(stay.latitude).toBeCloseTo(31.1048);
    expect(stay.longitude).toBeCloseTo(77.1734);
  });

  it("coerces numeric strings (Postgres numeric) to numbers", () => {
    const s = normalizeStay({ ...stateC, latitude: "31.5" as never, price_per_night: "1200.00" as never });
    expect(s.latitude).toBe(31.5);
    expect(s.price_per_night).toBe(1200);
  });
});

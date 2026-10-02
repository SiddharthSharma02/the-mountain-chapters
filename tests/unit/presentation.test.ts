import { describe, expect, it } from "vitest";
import { normalizeStay } from "@/lib/stays/normalize";
import { discountPercent, formatINR, startingPrice } from "@/lib/stays/pricing";
import { summarizeReviews } from "@/lib/stays/reviews";
import { formatDistance, formatTime, googleMapsPlaceUrl, roomFacts, stayedOn, truncate } from "@/lib/stays/format";
import { bookingCta, enquiryHref } from "@/lib/stays/cta";
import { moveItem } from "@/lib/stays/reorder";
import { stateA, stateB } from "../fixtures/stays";

describe("pricing", () => {
  it("uses the cheapest active room as the starting price", () => {
    expect(startingPrice(normalizeStay(stateB))).toEqual({ amount: 5999, source: "rooms" });
  });

  it("ignores inactive rooms even when they are cheaper", () => {
    // stateB has an inactive room at ₹100; it must not become the headline price.
    expect(startingPrice(normalizeStay(stateB))?.amount).not.toBe(100);
  });

  it("falls back to the legacy stay price when there are no rooms", () => {
    expect(startingPrice(normalizeStay(stateA))).toEqual({ amount: 4500, source: "stay" });
  });

  it("falls back to the stay price when rooms exist but none has a price", () => {
    const s = normalizeStay({
      ...stateB,
      rooms: stateB.rooms.map((r) => ({ ...r, price_per_night: null })),
    });
    expect(startingPrice(s)).toEqual({ amount: 3000, source: "stay" });
  });

  it("returns null rather than inventing a price", () => {
    expect(startingPrice(normalizeStay({ ...stateA, price_per_night: null }))).toBeNull();
    expect(startingPrice(normalizeStay({ ...stateA, price_per_night: 0 }))).toBeNull();
  });

  it("formats rupees with Indian digit grouping and no decimals for whole numbers", () => {
    expect(formatINR(5999)).toBe("₹5,999");
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR(5999.5)).toBe("₹5,999.50");
  });

  it("only reports a discount when the original price is genuinely higher", () => {
    expect(discountPercent(5999, 6999)).toBe(14);
    expect(discountPercent(5999, 5999)).toBeNull();
    expect(discountPercent(5999, 4000)).toBeNull();
    expect(discountPercent(5999, null)).toBeNull();
    expect(discountPercent(null, 6999)).toBeNull();
  });
});

describe("summarizeReviews", () => {
  it("averages actual reviews to one decimal", () => {
    const s = summarizeReviews(normalizeStay(stateB));
    expect(s).toMatchObject({ source: "reviews", average: 4.5, count: 2 });
  });

  it("only reports category scores that at least one review supplied", () => {
    const s = summarizeReviews(normalizeStay(stateB));
    expect(s.categories).toEqual([
      { key: "cleanliness_rating", label: "Cleanliness", average: 4.5 },
      { key: "location_rating", label: "Location", average: 4 },
    ]);
  });

  it("falls back to the legacy rating when no reviews exist", () => {
    expect(summarizeReviews(normalizeStay(stateA))).toEqual({
      source: "legacy",
      average: 4.8,
      count: 126,
      categories: [],
    });
  });

  it("reports nothing when there is no data at all", () => {
    expect(summarizeReviews(normalizeStay({ ...stateA, rating: 0, review_count: 0 }))).toEqual({
      source: "none",
      average: null,
      count: 0,
      categories: [],
    });
  });
});

describe("format helpers", () => {
  it("formats 24h times as 12h", () => {
    expect(formatTime("15:00")).toBe("3:00 PM");
    expect(formatTime("11:00")).toBe("11:00 AM");
    expect(formatTime("00:30")).toBe("12:30 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("15:00:00")).toBe("3:00 PM");
  });

  it("passes through free-text times and handles empties", () => {
    expect(formatTime("Flexible")).toBe("Flexible");
    expect(formatTime(null)).toBeNull();
    expect(formatTime("")).toBeNull();
  });

  it("builds room facts only from fields that exist", () => {
    expect(roomFacts({ bed_type: "King Bed", room_size: "350 sq ft", max_guests: 2 })).toEqual([
      "King Bed",
      "350 sq ft",
      "2 guests",
    ]);
    expect(roomFacts({ bed_type: null, room_size: null, max_guests: 1 })).toEqual(["1 guest"]);
    expect(roomFacts({ bed_type: null, room_size: null, max_guests: null })).toEqual([]);
  });

  it("formats review stay dates", () => {
    expect(stayedOn("2026-03-14")).toBe("Stayed in March 2026");
    expect(stayedOn(null)).toBeNull();
    expect(stayedOn("not a date")).toBeNull();
  });

  it("formats distances", () => {
    expect(formatDistance(8.2)).toBe("8.2 km");
    expect(formatDistance(14)).toBe("14 km");
    expect(formatDistance(0.4)).toBe("400 m");
    expect(formatDistance(null)).toBeNull();
  });

  it("builds a Google Maps URL that targets a Place ID", () => {
    const url = new URL(googleMapsPlaceUrl({
      name: "The Morel House",
      address: "Mashobra, Shimla",
      googlePlaceId: "ChIJ-test-place",
    }));
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("The Morel House, Mashobra, Shimla");
    expect(url.searchParams.get("query_place_id")).toBe("ChIJ-test-place");
  });

  it("truncates on a word boundary with an ellipsis", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("one two three four", 12)).toBe("one two…");
    expect(truncate(null, 10)).toBe("");
  });
});

describe("booking CTA", () => {
  it("stays hidden on the hero", () => {
    expect(bookingCta({ pastHero: false, reachedRooms: false, hasRooms: true }).visible).toBe(false);
  });

  it("points to rooms after the hero when rooms exist and haven't been reached", () => {
    expect(bookingCta({ pastHero: true, reachedRooms: false, hasRooms: true })).toEqual({
      visible: true,
      label: "View rooms",
      action: "rooms",
    });
  });

  it("switches to Check availability once rooms are reached", () => {
    expect(bookingCta({ pastHero: true, reachedRooms: true, hasRooms: true })).toEqual({
      visible: true,
      label: "Check availability",
      action: "enquire",
    });
  });

  it("goes straight to Check availability when there are no rooms", () => {
    expect(bookingCta({ pastHero: true, reachedRooms: false, hasRooms: false }).action).toBe("enquire");
  });

  it("builds an encoded enquiry link without claiming availability", () => {
    expect(enquiryHref("the-morel-house")).toBe("/contact?stay=the-morel-house");
    expect(enquiryHref("a b", "room & co")).toBe("/contact?stay=a+b&room=room+%26+co");
  });
});

describe("moveItem", () => {
  it("moves an item to a new index immutably", () => {
    const src = ["a", "b", "c", "d"];
    expect(moveItem(src, 3, 1)).toEqual(["a", "d", "b", "c"]);
    expect(moveItem(src, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(src).toEqual(["a", "b", "c", "d"]);
  });

  it("is a no-op for out-of-range or identical indices", () => {
    const src = ["a", "b"];
    expect(moveItem(src, 0, 0)).toBe(src);
    expect(moveItem(src, -1, 1)).toBe(src);
    expect(moveItem(src, 0, 5)).toBe(src);
  });
});

import { describe, expect, it } from "vitest";
import {
  isUuid,
  isValidUploadFolder,
  parseAmenities,
  parseCoordinates,
  parseImages,
  parseReview,
  parseRoom,
  parseSection,
  parseStayBasics,
  safeImageUrl,
  slugify,
} from "@/lib/stays/validation";

const U1 = "00000000-0000-4000-8000-000000000001";
const U2 = "00000000-0000-4000-8000-000000000002";

describe("slugify", () => {
  it("lowercases, hyphenates and trims", () => {
    expect(slugify("  Deluxe Mountain Room! ")).toBe("deluxe-mountain-room");
    expect(slugify("Café & Bar -- 2")).toBe("caf-bar-2");
    expect(slugify("---")).toBe("");
  });
});

describe("isUuid", () => {
  it("accepts uuids and rejects everything else", () => {
    expect(isUuid(U1)).toBe(true);
    expect(isUuid("1; drop table")).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe("safeImageUrl", () => {
  it("accepts https and site-relative URLs", () => {
    expect(safeImageUrl("https://images.unsplash.com/x.jpg")).toBe("https://images.unsplash.com/x.jpg");
    expect(safeImageUrl("/placeholder-mountain.svg")).toBe("/placeholder-mountain.svg");
  });

  it("rejects script, data, protocol-relative and plain-http URLs", () => {
    expect(safeImageUrl("javascript:alert(1)")).toBeNull();
    expect(safeImageUrl("data:image/png;base64,AAA")).toBeNull();
    expect(safeImageUrl("//evil.com/x.png")).toBeNull();
    expect(safeImageUrl("http://insecure.com/x.png")).toBeNull();
    expect(safeImageUrl("")).toBeNull();
    expect(safeImageUrl(null)).toBeNull();
  });
});

describe("parseStayBasics", () => {
  it("requires a name and a usable slug", () => {
    expect(parseStayBasics({ name: "", slug: "x" }).ok).toBe(false);
    expect(parseStayBasics({ name: "X", slug: "!!!" }).ok).toBe(false);
  });

  it("whitelists fields and normalises values", () => {
    const r = parseStayBasics({
      name: "  The Mountain Chapters ",
      slug: "The Mountain Chapters",
      destination_id: U1,
      property_type: "Boutique stay",
      short_description: " Above the clouds ",
      description: "",
      address: "Mashobra",
      is_featured: true,
      is_published: "yes", // not a boolean → false
      price_per_night: "5999",
      rating: 5, // not accepted here: rating belongs to reviews
      role: "admin", // unknown field → dropped
    });
    expect(r).toEqual({
      ok: true,
      value: {
        name: "The Mountain Chapters",
        slug: "the-mountain-chapters",
        destination_id: U1,
        property_type: "Boutique stay",
        short_description: "Above the clouds",
        description: null,
        address: "Mashobra",
        is_featured: true,
        is_published: false,
        price_per_night: 5999,
      },
    });
  });

  it("rejects a non-uuid destination and negative prices", () => {
    const r = parseStayBasics({ name: "A", slug: "a", destination_id: "abc", price_per_night: -5 });
    expect(r.ok && r.value.destination_id).toBeNull();
    expect(r.ok && r.value.price_per_night).toBeNull();
  });
});

describe("parseRoom", () => {
  const good = { name: "Deluxe", slug: "Deluxe", price_per_night: "5999", max_guests: "2", is_active: true };

  it("requires a name and slug", () => {
    expect(parseRoom({ ...good, name: " " }).ok).toBe(false);
    expect(parseRoom({ ...good, slug: "" }).ok).toBe(true); // slug derives from name
    expect(parseRoom({ ...good, slug: "" }).ok && (parseRoom({ ...good, slug: "" }) as { value: { slug: string } }).value.slug).toBe("deluxe");
  });

  it("parses numbers and keeps free-text size/view", () => {
    const r = parseRoom({ ...good, room_size: "350 sq ft", view: "Mountain View", bed_type: "King Bed" });
    expect(r.ok && r.value).toMatchObject({
      price_per_night: 5999,
      max_guests: 2,
      room_size: "350 sq ft",
      view: "Mountain View",
      bed_type: "King Bed",
      is_active: true,
    });
  });

  it("drops an original price that is not higher than the price (no fake discounts)", () => {
    expect(parseRoom({ ...good, original_price: "5000" }).ok && (parseRoom({ ...good, original_price: "5000" }) as { value: { original_price: unknown } }).value.original_price).toBeNull();
    const r = parseRoom({ ...good, original_price: "6999" });
    expect(r.ok && r.value.original_price).toBe(6999);
  });

  it("clamps guests to a sane whole number", () => {
    expect((parseRoom({ ...good, max_guests: "2.7" }) as { ok: true; value: { max_guests: number } }).value.max_guests).toBe(2);
    expect((parseRoom({ ...good, max_guests: "0" }) as { ok: true; value: { max_guests: unknown } }).value.max_guests).toBeNull();
    expect((parseRoom({ ...good, max_guests: "500" }) as { ok: true; value: { max_guests: unknown } }).value.max_guests).toBeNull();
  });

  it("treats a missing is_active as active", () => {
    const { is_active: _drop, ...rest } = good;
    void _drop;
    expect((parseRoom(rest) as { ok: true; value: { is_active: boolean } }).value.is_active).toBe(true);
  });
});

describe("parseReview", () => {
  const good = { id: U1, reviewer_name: "Ananya", rating: "5", review_text: "Loved it" };

  it("requires name, text and a 1–5 rating", () => {
    expect(parseReview(good).ok).toBe(true);
    expect(parseReview({ ...good, reviewer_name: "" }).ok).toBe(false);
    expect(parseReview({ ...good, review_text: "  " }).ok).toBe(false);
    expect(parseReview({ ...good, rating: "0" }).ok).toBe(false);
    expect(parseReview({ ...good, rating: "6" }).ok).toBe(false);
    expect(parseReview({ ...good, rating: "" }).ok).toBe(false);
  });

  it("rejects a review without a valid client id", () => {
    expect(parseReview({ ...good, id: "nope" }).ok).toBe(false);
  });

  it("keeps optional category ratings only when within 1–5", () => {
    const r = parseReview({ ...good, cleanliness_rating: "4.5", value_rating: "9", location_rating: "" });
    expect(r.ok && r.value.cleanliness_rating).toBe(4.5);
    expect(r.ok && r.value.value_rating).toBeNull();
    expect(r.ok && r.value.location_rating).toBeNull();
  });

  it("accepts only ISO dates and uuid room ids", () => {
    const r = parseReview({ ...good, stayed_on: "March", room_id: "x" });
    expect(r.ok && r.value.stayed_on).toBeNull();
    expect(r.ok && r.value.room_id).toBeNull();
    const r2 = parseReview({ ...good, stayed_on: "2026-03-14", room_id: U2 });
    expect(r2.ok && r2.value.stayed_on).toBe("2026-03-14");
    expect(r2.ok && r2.value.room_id).toBe(U2);
  });

  it("sanitises reviewer and guest photo URLs", () => {
    const r = parseReview({ ...good, reviewer_image: "javascript:x", guest_photo: "https://a.b/c.jpg" });
    expect(r.ok && r.value.reviewer_image).toBeNull();
    expect(r.ok && r.value.guest_photo).toBe("https://a.b/c.jpg");
  });
});

describe("parseSection", () => {
  it("whitelists the section type", () => {
    expect(parseSection({ id: U1, type: "script" }).ok).toBe(false);
    expect(parseSection({ id: U1, type: "image", image_url: "https://a.b/c.jpg" }).ok).toBe(true);
  });

  it("only keeps the reference that matches the type", () => {
    const r = parseSection({ id: U1, type: "review", review_id: U2, room_id: U2 });
    expect(r.ok && r.value.review_id).toBe(U2);
    expect(r.ok && r.value.room_id).toBeNull();
  });

  it("requires an image for image sections and a reference for review/room sections", () => {
    expect(parseSection({ id: U1, type: "image" }).ok).toBe(false);
    expect(parseSection({ id: U1, type: "review" }).ok).toBe(false);
    expect(parseSection({ id: U1, type: "room" }).ok).toBe(false);
  });

  it("requires some text for story and quote sections", () => {
    expect(parseSection({ id: U1, type: "story" }).ok).toBe(false);
    expect(parseSection({ id: U1, type: "quote", title: "Hello" }).ok).toBe(true);
  });
});

describe("parseAmenities", () => {
  it("trims, drops blanks and de-duplicates case-insensitively", () => {
    const r = parseAmenities([
      { id: U1, name: " Wi-Fi ", category: "Essentials" },
      { id: U2, name: "wi-fi", category: "Essentials" },
      { id: "00000000-0000-4000-8000-000000000003", name: "", category: "Other" },
      { id: "00000000-0000-4000-8000-000000000004", name: "Private chef" },
    ]);
    expect(r).toEqual([
      { id: U1, name: "Wi-Fi", category: "Essentials", icon: null },
      { id: "00000000-0000-4000-8000-000000000004", name: "Private chef", category: "Other", icon: null },
    ]);
  });

  it("drops rows without a valid id", () => {
    expect(parseAmenities([{ id: "bad", name: "Spa" }])).toEqual([]);
  });

  it("returns an empty list for non-array input", () => {
    expect(parseAmenities("Wi-Fi, Parking")).toEqual([]);
  });
});

describe("parseImages", () => {
  it("keeps valid images, drops unsafe URLs and coerces unknown types", () => {
    expect(
      parseImages(
        [
          { id: U1, image_url: "https://a.b/1.jpg", image_type: "bathroom" },
          { id: U2, image_url: "javascript:alert(1)", image_type: "room" },
          { id: "00000000-0000-4000-8000-000000000003", image_url: "https://a.b/3.jpg", image_type: "selfie" },
        ],
        "room"
      )
    ).toEqual([
      { id: U1, image_url: "https://a.b/1.jpg", image_type: "bathroom", caption: null },
      { id: "00000000-0000-4000-8000-000000000003", image_url: "https://a.b/3.jpg", image_type: "room", caption: null },
    ]);
  });
});

describe("parseCoordinates", () => {
  it("accepts a valid pair or an empty pair", () => {
    expect(parseCoordinates("31.1", "77.17")).toEqual({ ok: true, value: { latitude: 31.1, longitude: 77.17 } });
    expect(parseCoordinates("", "")).toEqual({ ok: true, value: { latitude: null, longitude: null } });
  });

  it("rejects half pairs and out-of-range values", () => {
    expect(parseCoordinates("31.1", "").ok).toBe(false);
    expect(parseCoordinates("91", "77").ok).toBe(false);
    expect(parseCoordinates("31", "181").ok).toBe(false);
  });
});

describe("isValidUploadFolder", () => {
  it("allows only the organised stay paths", () => {
    expect(isValidUploadFolder(`${U1}/cover`)).toBe(true);
    expect(isValidUploadFolder(`${U1}/gallery`)).toBe(true);
    expect(isValidUploadFolder(`${U1}/story`)).toBe(true);
    expect(isValidUploadFolder(`${U1}/reviews`)).toBe(true);
    expect(isValidUploadFolder(`${U1}/seo`)).toBe(true);
    expect(isValidUploadFolder(`${U1}/rooms/${U2}`)).toBe(true);
  });

  it("rejects traversal and unknown folders", () => {
    expect(isValidUploadFolder(`${U1}/../other`)).toBe(false);
    expect(isValidUploadFolder(`${U1}/rooms/../../x`)).toBe(false);
    expect(isValidUploadFolder("gallery")).toBe(false);
    expect(isValidUploadFolder(`${U1}/secret`)).toBe(false);
  });
});

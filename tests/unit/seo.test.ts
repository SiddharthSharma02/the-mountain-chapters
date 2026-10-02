import { describe, expect, it } from "vitest";
import { normalizeStay } from "@/lib/stays/normalize";
import { buildStayJsonLd, buildStayMetadata, serializeJsonLd } from "@/lib/stays/seo";
import { stateA, stateB, stateC } from "../fixtures/stays";

type Node = Record<string, unknown>;
const lodging = (raw: Parameters<typeof normalizeStay>[0]) =>
  buildStayJsonLd(normalizeStay(raw)).find((n) => n["@type"] !== "BreadcrumbList") as Node;
const breadcrumb = (raw: Parameters<typeof normalizeStay>[0]) =>
  buildStayJsonLd(normalizeStay(raw)).find((n) => n["@type"] === "BreadcrumbList") as Node;

describe("buildStayMetadata", () => {
  it("prefers SEO overrides", () => {
    const m = buildStayMetadata(normalizeStay(stateC));
    expect(m.title).toBe("SEO title");
    expect(m.description).toBe("SEO description");
    expect(m.ogImage).toBe(stateC.og_image);
  });

  it("falls back to name, short description and cover image", () => {
    const m = buildStayMetadata(normalizeStay(stateB));
    expect(m.title).toBe("The Mountain Chapters · Mashobra");
    expect(m.description).toBe("Mountain retreat above the clouds");
    expect(m.ogImage).toBe(stateB.cover_image);
  });

  it("falls back to a truncated description when there is no short description", () => {
    const long = "word ".repeat(80).trim();
    const m = buildStayMetadata(normalizeStay({ ...stateA, description: long }));
    expect(m.description.length).toBeLessThanOrEqual(160);
    expect(m.description.endsWith("…")).toBe(true);
  });

  it("uses /stays/[slug] as the canonical path", () => {
    expect(buildStayMetadata(normalizeStay(stateA)).canonical).toBe("/stays/the-morel-house");
  });
});

describe("buildStayJsonLd", () => {
  it("describes the stay as a LodgingBusiness, or a Hotel for hotels/resorts", () => {
    expect(lodging(stateB)["@type"]).toBe("LodgingBusiness");
    expect(lodging({ ...stateB, property_type: "Hotel" })["@type"]).toBe("Hotel");
    expect(lodging({ ...stateB, property_type: "Resort" })["@type"]).toBe("Hotel");
  });

  it("includes an AggregateRating only when computed from actual reviews", () => {
    expect(lodging(stateB).aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 2,
      bestRating: 5,
      worstRating: 1,
    });
    // State A has only the legacy summary numbers — no reviews on the page to back them.
    expect(lodging(stateA).aggregateRating).toBeUndefined();
    expect(lodging(stateA).review).toBeUndefined();
  });

  it("includes only active reviews", () => {
    const reviews = lodging(stateB).review as Node[];
    expect(reviews.map((r) => (r.author as Node).name)).toEqual(["Guest 1", "Guest 2"]);
  });

  it("emits offers only for active rooms that have a price, and never availability", () => {
    const offers = lodging(stateB).makesOffer as Node[];
    expect(offers.map((o) => o.name)).toEqual(["Forest View Suite", "Deluxe Mountain Room"]);
    for (const o of offers) {
      expect(o.priceCurrency).toBe("INR");
      expect(o).not.toHaveProperty("availability");
    }
    const noPrice = lodging({ ...stateB, rooms: stateB.rooms.map((r) => ({ ...r, price_per_night: null })) });
    expect(noPrice.makesOffer).toBeUndefined();
    expect(JSON.stringify(buildStayJsonLd(normalizeStay(stateC)))).not.toMatch(/availability/i);
  });

  it("adds geo only when coordinates exist", () => {
    expect(lodging(stateA).geo).toBeUndefined();
    expect(lodging(stateC).geo).toEqual({ "@type": "GeoCoordinates", latitude: 31.1048, longitude: 77.1734 });
  });

  it("maps amenities to amenityFeature", () => {
    expect(lodging(stateB).amenityFeature).toEqual([
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Bonfire", value: true },
    ]);
  });

  it("adds check-in/out times only in HH:MM form", () => {
    expect(lodging(stateC).checkinTime).toBe("15:00");
    expect(lodging({ ...stateC, check_in_time: "Afternoon" }).checkinTime).toBeUndefined();
  });

  it("uses a price range only from real prices", () => {
    expect(lodging(stateB).priceRange).toBe("₹5,999 – ₹7,499");
    expect(lodging({ ...stateA, price_per_night: null }).priceRange).toBeUndefined();
  });

  it("builds a breadcrumb Home › Stays › Stay", () => {
    const items = (breadcrumb(stateA).itemListElement as Node[]).map((i) => i.name);
    expect(items).toEqual(["Home", "Stays", "The Morel House"]);
  });

  it("serialises JSON-LD safely against </script> injection", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script");
  });
});

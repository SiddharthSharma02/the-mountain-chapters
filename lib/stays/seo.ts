import { truncate } from "@/lib/stays/format";
import { formatINR } from "@/lib/stays/pricing";
import { summarizeReviews } from "@/lib/stays/reviews";
import type { StayProfile } from "@/lib/stays/types";

export const SITE_URL = "https://themountainchapters.com";

export interface StayMetadata {
  title: string;
  description: string;
  canonical: string;
  ogImage: string | null;
}

export function buildStayMetadata(stay: StayProfile): StayMetadata {
  const place = stay.destination?.name;
  return {
    title: stay.seo_title || (place ? `${stay.name} · ${place}` : stay.name),
    description:
      stay.seo_description ||
      stay.short_description ||
      truncate(stay.description, 160) ||
      `${stay.name}${place ? ` in ${place}` : ""} — a stay curated by The Mountain Chapters.`,
    canonical: `/stays/${stay.slug}`,
    ogImage: stay.og_image || stay.heroImage,
  };
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
type Node = Record<string, unknown>;

/**
 * schema.org data built strictly from stored data. No availability is ever emitted, and
 * ratings/reviews appear only when real reviews are on the page.
 */
export function buildStayJsonLd(stay: StayProfile): Node[] {
  const url = `${SITE_URL}/stays/${stay.slug}`;
  const images = [...new Set([stay.heroImage, ...stay.gallery.map((g) => g.url)].filter(Boolean))].slice(0, 10);
  const summary = summarizeReviews(stay);
  const pricedRooms = stay.rooms.filter((r) => r.is_active && r.price_per_night && r.price_per_night > 0);
  const prices = pricedRooms.map((r) => r.price_per_night as number);
  if (prices.length === 0 && stay.price_per_night && stay.price_per_night > 0) prices.push(stay.price_per_night);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const lodging: Node = {
    "@context": "https://schema.org",
    "@type": /hotel|resort/i.test(stay.property_type ?? "") ? "Hotel" : "LodgingBusiness",
    "@id": `${url}#lodging`,
    name: stay.name,
    url,
  };
  const description = stay.short_description || stay.description;
  if (description) lodging.description = description;
  if (images.length > 0) lodging.image = images;
  if (stay.address || stay.destination) {
    lodging.address = {
      "@type": "PostalAddress",
      ...(stay.address ? { streetAddress: stay.address } : {}),
      ...(stay.destination?.name ? { addressLocality: stay.destination.name } : {}),
      ...(stay.destination?.state ? { addressRegion: stay.destination.state } : {}),
      addressCountry: "IN",
    };
  }
  if (stay.latitude !== null && stay.longitude !== null) {
    lodging.geo = { "@type": "GeoCoordinates", latitude: stay.latitude, longitude: stay.longitude };
  }
  if (stay.amenities.length > 0) {
    lodging.amenityFeature = stay.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification", name: a.name, value: true,
    }));
  }
  if (stay.check_in_time && HHMM.test(stay.check_in_time)) lodging.checkinTime = stay.check_in_time;
  if (stay.check_out_time && HHMM.test(stay.check_out_time)) lodging.checkoutTime = stay.check_out_time;
  if (prices.length > 0) lodging.priceRange = min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`;
  if (pricedRooms.length > 0) {
    lodging.makesOffer = pricedRooms.map((r) => ({
      "@type": "Offer",
      name: r.name,
      price: r.price_per_night,
      priceCurrency: "INR",
      url,
    }));
  }
  if (summary.source === "reviews" && summary.average !== null) {
    lodging.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
    lodging.review = stay.reviews.filter((r) => r.is_active).slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.reviewer_name },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      reviewBody: r.review_text,
      ...(r.stayed_on ? { datePublished: r.stayed_on } : {}),
    }));
  }

  const breadcrumb: Node = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Stays", item: `${SITE_URL}/stays` },
      { "@type": "ListItem", position: 3, name: stay.name, item: url },
    ],
  };

  return [lodging, breadcrumb];
}

/** JSON for a <script type="application/ld+json">, escaped against </script> injection. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

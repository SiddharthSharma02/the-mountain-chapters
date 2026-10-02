import { startingPrice } from "@/lib/stays/pricing";
import { summarizeReviews, type ReviewSummary } from "@/lib/stays/reviews";
import type { Amenity, FaqRow, GalleryImage, Review, Room, StayProfile } from "@/lib/stays/types";

/**
 * The stay page is a sequence of blocks after the hero + identity. Each block reveals
 * one new thing about the property (the "Hinge profile" scroll). Admin-authored story
 * sections decide the opening; structured data fills the rest in a fixed order.
 */
export type TimelineBlock =
  | { kind: "image"; key: string; imageUrl: string; title: string | null; body: string | null }
  | { kind: "story"; key: string; title: string | null; subtitle: string | null; body: string | null; imageUrl: string | null }
  | { kind: "experience"; key: string; title: string | null; subtitle: string | null; body: string | null; imageUrl: string | null }
  | { kind: "quote"; key: string; text: string; attribution: string | null }
  | { kind: "review"; key: string; review: Review }
  | { kind: "room"; key: string; room: Room }
  | { kind: "gallery"; key: string; title: string | null; images: GalleryImage[] }
  | { kind: "rooms"; key: string; rooms: Room[]; fallbackPrice: number | null }
  | { kind: "amenities"; key: string; title: string | null; amenities: Amenity[] }
  | { kind: "location"; key: string; title: string | null }
  | { kind: "reviews"; key: string; reviews: Review[]; summary: ReviewSummary }
  | { kind: "rules"; key: string }
  | { kind: "faq"; key: string; faqs: FaqRow[] }
  | { kind: "book"; key: string };

const AUTO_IMAGES = 4;
const AUTO_REVIEWS = 2;

export const hasLocation = (s: StayProfile) =>
  Boolean(s.address?.trim() || s.google_place_id?.trim()) || (s.latitude !== null && s.longitude !== null) || s.nearby.length > 0;

export const hasRules = (s: StayProfile) =>
  Boolean(
    s.check_in_time || s.check_out_time ||
    (s.policies && (s.policies.pets || s.policies.smoking || s.policies.children ||
      s.policies.cancellation_policy || s.policies.extra_rules))
  );

/** Blocks built from the admin's story sections, skipping anything that can't render. */
function authoredStory(stay: StayProfile): TimelineBlock[] {
  const reviews = new Map(stay.reviews.map((r) => [r.id, r]));
  const rooms = new Map(stay.rooms.map((r) => [r.id, r]));
  const blocks: TimelineBlock[] = [];

  for (const s of stay.sections) {
    const key = `section-${s.id}`;
    switch (s.type) {
      case "image":
        if (s.image_url) blocks.push({ kind: "image", key, imageUrl: s.image_url, title: s.title, body: s.body });
        break;
      case "story":
      case "experience":
        if (s.title || s.body) {
          blocks.push({ kind: s.type, key, title: s.title, subtitle: s.subtitle, body: s.body, imageUrl: s.image_url });
        }
        break;
      case "quote": {
        const text = s.title || s.body;
        if (text) blocks.push({ kind: "quote", key, text, attribution: s.subtitle });
        break;
      }
      case "review": {
        const review = s.review_id ? reviews.get(s.review_id) : undefined;
        if (review) blocks.push({ kind: "review", key, review });
        break;
      }
      case "room": {
        const room = s.room_id ? rooms.get(s.room_id) : undefined;
        if (room) blocks.push({ kind: "room", key, room });
        break;
      }
      case "gallery":
        if (stay.gallery.length > 0) blocks.push({ kind: "gallery", key, title: s.title, images: stay.gallery });
        break;
      case "amenities":
        if (stay.amenities.length > 0) blocks.push({ kind: "amenities", key, title: s.title, amenities: stay.amenities });
        break;
      case "location":
        if (hasLocation(stay)) blocks.push({ kind: "location", key, title: s.title });
        break;
    }
  }
  return blocks;
}

/**
 * For stays without authored sections: alternate property photos with guest reviews
 * so social proof appears while the guest is still discovering the place. Uses only
 * real data — photos carry no invented captions.
 */
function autoStory(stay: StayProfile): TimelineBlock[] {
  const images = stay.gallery.filter((g) => g.url !== stay.heroImage).slice(0, AUTO_IMAGES);
  const highlighted = stay.reviews.filter((r) => r.is_highlight);
  // One review per photo gap (at least one), so guest quotes never stack back-to-back.
  const reviews = [...highlighted, ...stay.reviews.filter((r) => !r.is_highlight)].slice(
    0,
    Math.min(AUTO_REVIEWS, Math.max(1, images.length))
  );

  const blocks: TimelineBlock[] = [];
  const image = (g: GalleryImage) =>
    blocks.push({ kind: "image", key: `auto-image-${g.id}`, imageUrl: g.url, title: null, body: null });

  if (images[0]) image(images[0]);
  if (stay.description?.trim()) {
    blocks.push({ kind: "story", key: "auto-story", title: null, subtitle: null, body: stay.description, imageUrl: null });
  }
  for (let i = 0; i < Math.max(images.length - 1, reviews.length); i++) {
    if (reviews[i]) blocks.push({ kind: "review", key: `auto-review-${reviews[i].id}`, review: reviews[i] });
    if (images[i + 1]) image(images[i + 1]);
  }
  return blocks;
}

export function buildStayTimeline(stay: StayProfile): TimelineBlock[] {
  const story = stay.sections.length > 0 ? authoredStory(stay) : autoStory(stay);
  const placed = (kind: TimelineBlock["kind"]) => story.some((b) => b.kind === kind);
  const featuredRooms = new Set(story.flatMap((b) => (b.kind === "room" ? [b.room.id] : [])));

  const blocks: TimelineBlock[] = [...story];

  const remainingRooms = stay.rooms.filter((r) => !featuredRooms.has(r.id));
  if (remainingRooms.length > 0 || stay.rooms.length === 0) {
    const fallback = startingPrice({ rooms: [], price_per_night: stay.price_per_night });
    blocks.push({ kind: "rooms", key: "rooms", rooms: remainingRooms, fallbackPrice: fallback?.amount ?? null });
  }
  if (stay.amenities.length > 0 && !placed("amenities")) {
    blocks.push({ kind: "amenities", key: "amenities", title: null, amenities: stay.amenities });
  }
  if (hasLocation(stay) && !placed("location")) {
    blocks.push({ kind: "location", key: "location", title: null });
  }
  const summary = summarizeReviews(stay);
  if (summary.source !== "none") {
    blocks.push({ kind: "reviews", key: "reviews", reviews: stay.reviews, summary });
  }
  if (hasRules(stay)) blocks.push({ kind: "rules", key: "rules" });
  if (stay.faqs.length > 0) blocks.push({ kind: "faq", key: "faq", faqs: stay.faqs });
  blocks.push({ kind: "book", key: "book" });
  return blocks;
}

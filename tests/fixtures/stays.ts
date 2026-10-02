/**
 * Raw rows shaped like the nested Supabase select used by the public stay page.
 * Test-only data: never written to the database.
 */
import type { RawStayRow } from "@/lib/stays/types";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600`;

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const base = {
  destination_id: uuid(900),
  address: "Mashobra, Shimla",
  rating: 0,
  review_count: 0,
  is_featured: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
  destinations: { name: "Mashobra", state: "Himachal Pradesh", slug: "mashobra" },
  short_description: null,
  property_type: null,
  latitude: null,
  longitude: null,
  google_place_id: null,
  check_in_time: null,
  check_out_time: null,
  seo_title: null,
  seo_description: null,
  og_image: null,
  is_published: true,
};

/** State A — a legacy stay: arrays on the stays row, no relational children. */
export const stateA: RawStayRow = {
  ...base,
  id: uuid(1),
  name: "The Morel House",
  slug: "the-morel-house",
  description: "A quiet wooden house above the orchards.",
  price_per_night: 4500,
  rating: 4.8,
  review_count: 126,
  cover_image: img("cover-a"),
  images: [img("a1"), "", img("a2"), img("a3")],
  amenities: ["WiFi", "Bonfire", " Mountain View ", "Breakfast Included", ""],
  stay_images: [],
  stay_amenities: [],
  stay_sections: [],
  rooms: [],
  stay_reviews: [],
  stay_faqs: [],
  stay_policies: null,
  stay_nearby_places: [],
};

const deluxe = {
  id: uuid(101),
  stay_id: uuid(2),
  name: "Deluxe Mountain Room",
  slug: "deluxe-mountain-room",
  description: "Wake up facing the ridge.",
  price_per_night: 5999,
  original_price: 6999,
  max_guests: 2,
  bed_type: "King Bed",
  room_size: "350 sq ft",
  view: "Mountain View",
  sort_order: 1,
  is_active: true,
  room_images: [
    { id: uuid(1012), room_id: uuid(101), image_url: img("r1-2"), image_type: "bathroom", sort_order: 1 },
    { id: uuid(1011), room_id: uuid(101), image_url: img("r1-1"), image_type: "room", sort_order: 0 },
  ],
  room_amenities: [
    { id: uuid(1021), name: "Private balcony", category: "Views", icon: null, sort_order: 0 },
  ],
  room_rate_plans: [
    {
      id: uuid(1031), room_id: uuid(101), name: "Room only", price_per_night: 5999, meal_plan: null,
      cancellation_policy: "Free cancellation until 7 days before arrival", payment_policy: null,
      is_active: true, sort_order: 0,
    },
    {
      id: uuid(1032), room_id: uuid(101), name: "Hidden plan", price_per_night: 1, meal_plan: null,
      cancellation_policy: null, payment_policy: null, is_active: false, sort_order: 1,
    },
  ],
};

const forest = {
  ...deluxe,
  id: uuid(102),
  name: "Forest View Suite",
  slug: "forest-view-suite",
  price_per_night: 7499,
  original_price: null,
  max_guests: 3,
  room_size: "480 sq ft",
  view: "Forest View",
  sort_order: 0,
  room_images: [],
  room_amenities: [],
  room_rate_plans: [],
};

const inactiveRoom = {
  ...deluxe,
  id: uuid(103),
  name: "Closed Cottage",
  slug: "closed-cottage",
  price_per_night: 100,
  is_active: false,
  sort_order: 2,
  room_images: [],
  room_amenities: [],
  room_rate_plans: [],
};

const review = (n: number, extra: Record<string, unknown> = {}) => ({
  id: uuid(200 + n),
  stay_id: uuid(2),
  room_id: null,
  reviewer_name: `Guest ${n}`,
  rating: 5,
  review_text: `Review text ${n}`,
  traveller_type: "Couple",
  stayed_on: "2026-03-14",
  reviewer_image: null,
  guest_photo: null,
  cleanliness_rating: null,
  location_rating: null,
  hospitality_rating: null,
  facilities_rating: null,
  value_rating: null,
  is_highlight: false,
  is_active: true,
  sort_order: n,
  created_at: "2026-03-20T00:00:00Z",
  ...extra,
});

/** State B — relational gallery, amenities, rooms and reviews, but no story sections. */
export const stateB: RawStayRow = {
  ...base,
  id: uuid(2),
  name: "The Mountain Chapters",
  slug: "the-mountain-chapters",
  description: "Slow mornings, quiet rooms and uninterrupted views.",
  short_description: "Mountain retreat above the clouds",
  property_type: "Boutique stay",
  price_per_night: 3000,
  rating: 4.2,
  review_count: 999,
  cover_image: img("cover-b"),
  images: [img("legacy-should-not-be-used")],
  amenities: ["Legacy amenity"],
  stay_images: [
    { id: uuid(301), stay_id: uuid(2), image_url: img("b2"), image_type: "view", caption: null, sort_order: 1 },
    { id: uuid(300), stay_id: uuid(2), image_url: img("cover-b"), image_type: "exterior", caption: null, sort_order: 0 },
    { id: uuid(302), stay_id: uuid(2), image_url: img("b3"), image_type: "view", caption: null, sort_order: 2 },
    { id: uuid(303), stay_id: uuid(2), image_url: img("b4"), image_type: "other", caption: null, sort_order: 3 },
  ],
  stay_amenities: [
    { id: uuid(401), name: "Wi-Fi", category: "Essentials", icon: null, sort_order: 0 },
    { id: uuid(402), name: "Bonfire", category: "Outdoor", icon: null, sort_order: 1 },
  ],
  stay_sections: [],
  rooms: [deluxe, forest, inactiveRoom],
  stay_reviews: [
    review(1, { rating: 5, cleanliness_rating: 5, location_rating: 4 }),
    review(2, { rating: 4, cleanliness_rating: 4, is_highlight: true }),
    review(3, { rating: 4, is_active: false }),
  ],
  stay_faqs: [],
  stay_policies: null,
  stay_nearby_places: [],
};

/** State C — a fully built editorial stay with story sections, rules, location and FAQ. */
export const stateC: RawStayRow = {
  ...stateB,
  id: uuid(3),
  slug: "fully-built",
  latitude: 31.1048,
  longitude: 77.1734,
  google_place_id: "ChIJ-test-place",
  check_in_time: "15:00",
  check_out_time: "11:00",
  seo_title: "SEO title",
  seo_description: "SEO description",
  og_image: img("og"),
  stay_sections: [
    { id: uuid(501), stay_id: uuid(3), type: "image", title: "Wake up above the clouds", subtitle: null, body: "Slow mornings.", image_url: img("s1"), review_id: null, room_id: null, sort_order: 0, is_active: true },
    { id: uuid(502), stay_id: uuid(3), type: "review", title: null, subtitle: null, body: null, image_url: null, review_id: uuid(202), room_id: null, sort_order: 1, is_active: true },
    { id: uuid(503), stay_id: uuid(3), type: "room", title: null, subtitle: null, body: null, image_url: null, review_id: null, room_id: uuid(101), sort_order: 2, is_active: true },
    // Hidden section — must not render.
    { id: uuid(504), stay_id: uuid(3), type: "story", title: "Draft", subtitle: null, body: "Not ready", image_url: null, review_id: null, room_id: null, sort_order: 3, is_active: false },
    // Dangling references — the review/room was deleted or deactivated.
    { id: uuid(505), stay_id: uuid(3), type: "review", title: null, subtitle: null, body: null, image_url: null, review_id: uuid(203), room_id: null, sort_order: 4, is_active: true },
    { id: uuid(506), stay_id: uuid(3), type: "room", title: null, subtitle: null, body: null, image_url: null, review_id: null, room_id: uuid(103), sort_order: 5, is_active: true },
    // Image section without an image is invalid.
    { id: uuid(507), stay_id: uuid(3), type: "image", title: "No picture", subtitle: null, body: null, image_url: null, review_id: null, room_id: null, sort_order: 6, is_active: true },
    { id: uuid(508), stay_id: uuid(3), type: "amenities", title: "Everything you need", subtitle: null, body: null, image_url: null, review_id: null, room_id: null, sort_order: 7, is_active: true },
    { id: uuid(509), stay_id: uuid(3), type: "quote", title: "Evenings around the fire.", subtitle: "The host", body: null, image_url: null, review_id: null, room_id: null, sort_order: 8, is_active: true },
  ],
  stay_faqs: [
    { id: uuid(602), stay_id: uuid(3), question: "Is parking available?", answer: "Yes, on site.", sort_order: 1 },
    { id: uuid(601), stay_id: uuid(3), question: "Do you allow pets?", answer: "Small pets only.", sort_order: 0 },
  ],
  stay_policies: [
    { stay_id: uuid(3), pets: "Allowed", smoking: "Not permitted", children: "Welcome", cancellation_policy: "Free cancellation up to 7 days before arrival.", extra_rules: null },
  ],
  stay_nearby_places: [
    { id: uuid(702), stay_id: uuid(3), name: "Shimla Railway Station", distance_km: 14, sort_order: 1 },
    { id: uuid(701), stay_id: uuid(3), name: "Shimla Mall Road", distance_km: 8.2, sort_order: 0 },
  ],
};

export const ids = { uuid };

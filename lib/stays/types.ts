import type { Stay } from "@/lib/types/database";

export const ROOM_IMAGE_TYPES = ["room", "bathroom", "balcony", "view", "interior", "exterior", "other"] as const;
export type RoomImageType = (typeof ROOM_IMAGE_TYPES)[number];

export const STAY_IMAGE_TYPES = [
  "exterior", "interior", "view", "room", "bathroom", "balcony", "dining", "experience", "other",
] as const;
export type StayImageType = (typeof STAY_IMAGE_TYPES)[number];

export const SECTION_TYPES = [
  "image", "story", "quote", "review", "room", "gallery", "experience", "amenities", "location",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const BUILDER_TABS = ["basics", "media", "story", "amenities", "rooms", "reviews", "location", "policies", "seo"] as const;
export type BuilderTab = (typeof BUILDER_TABS)[number];

// ---------- Rows as stored ----------

export interface StayImageRow {
  id: string; stay_id: string; image_url: string; image_type: string; caption: string | null; sort_order: number;
}
export interface AmenityRow { id: string; name: string; category: string; icon: string | null; sort_order: number }
export interface RoomImageRow { id: string; room_id: string; image_url: string; image_type: string; sort_order: number }
export interface RatePlanRow {
  id: string; room_id: string; name: string; price_per_night: number | null; meal_plan: string | null;
  cancellation_policy: string | null; payment_policy: string | null; is_active: boolean; sort_order: number;
}
export interface RoomRow {
  id: string; stay_id: string; name: string; slug: string; description: string | null;
  price_per_night: number | null; original_price: number | null; max_guests: number | null;
  bed_type: string | null; room_size: string | null; view: string | null; sort_order: number; is_active: boolean;
  room_images?: RoomImageRow[]; room_amenities?: AmenityRow[]; room_rate_plans?: RatePlanRow[];
}
export interface ReviewRow {
  id: string; stay_id: string; room_id: string | null; reviewer_name: string; rating: number; review_text: string;
  traveller_type: string | null; stayed_on: string | null; reviewer_image: string | null; guest_photo: string | null;
  cleanliness_rating: number | null; location_rating: number | null; hospitality_rating: number | null;
  facilities_rating: number | null; value_rating: number | null; is_highlight: boolean; is_active: boolean;
  sort_order: number; created_at?: string;
}
export interface SectionRow {
  id: string; stay_id: string; type: string; title: string | null; subtitle: string | null; body: string | null;
  image_url: string | null; review_id: string | null; room_id: string | null; sort_order: number; is_active: boolean;
}
export interface FaqRow { id: string; stay_id: string; question: string; answer: string; sort_order: number }
export interface PoliciesRow {
  stay_id: string; pets: string | null; smoking: string | null; children: string | null;
  cancellation_policy: string | null; extra_rules: string | null;
}
export interface NearbyRow { id: string; stay_id: string; name: string; distance_km: number | null; sort_order: number }

export interface StayExtraColumns {
  short_description: string | null; property_type: string | null; latitude: number | null; longitude: number | null;
  check_in_time: string | null; check_out_time: string | null; google_place_id: string | null;
  seo_title: string | null; seo_description: string | null; og_image: string | null; is_published: boolean;
}

/** The stays row plus every child relation, as returned by STAY_FULL_SELECT. */
export type RawStayRow = Omit<Stay, "destinations"> & StayExtraColumns & {
  destinations?: { name: string | null; state: string | null; slug?: string | null } | null;
  stay_images: StayImageRow[];
  stay_amenities: AmenityRow[];
  stay_sections: SectionRow[];
  rooms: RoomRow[];
  stay_reviews: ReviewRow[];
  stay_faqs: FaqRow[];
  stay_policies: PoliciesRow | PoliciesRow[] | null;
  stay_nearby_places: NearbyRow[];
};

export const STAY_FULL_SELECT = `*, destinations(name, state, slug),
  stay_images(*), stay_amenities(*), stay_sections(*),
  rooms(*, room_images(*), room_amenities(*), room_rate_plans(*)),
  stay_reviews(*), stay_faqs(*), stay_policies(*), stay_nearby_places(*)`;

// ---------- Normalised profile used by the public page and the builder ----------

export interface GalleryImage { id: string; url: string; type: string; caption: string | null }
export interface Amenity { id: string; name: string; category: string; icon: string | null }
export interface Room extends Omit<RoomRow, "room_images" | "room_amenities" | "room_rate_plans"> {
  room_images: RoomImageRow[];
  room_amenities: Amenity[];
  room_rate_plans: RatePlanRow[];
}
export type Review = ReviewRow;
export type Section = Omit<SectionRow, "type"> & { type: SectionType };

export interface StayProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  property_type: string | null;
  address: string | null;
  destination_id: string | null;
  destination: { name: string | null; state: string | null; slug: string | null } | null;
  cover_image: string | null;
  heroImage: string | null;
  gallery: GalleryImage[];
  amenities: Amenity[];
  sections: Section[];
  rooms: Room[];
  reviews: Review[];
  faqs: FaqRow[];
  policies: PoliciesRow | null;
  nearby: NearbyRow[];
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  /** Legacy fallback price, used until rooms have prices. */
  price_per_night: number | null;
  /** Legacy rating summary, used only when there are no reviews. */
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  updated_at: string;
}

// ---------- Builder payload shapes ----------

export interface AmenityInput { id: string; name: string; category: string; icon: string | null }

import { categoryFor, STAY_AMENITY_CATALOG } from "@/lib/stays/amenity-catalog";
import {
  SECTION_TYPES,
  type Amenity,
  type GalleryImage,
  type RawStayRow,
  type Room,
  type Section,
  type SectionType,
  type StayProfile,
} from "@/lib/stays/types";

const bySort = <T extends { sort_order: number }>(rows: T[] | null | undefined): T[] =>
  [...(rows ?? [])].sort((a, b) => a.sort_order - b.sort_order);

/** Postgres `numeric` can arrive as a string; coerce and reject non-finite values. */
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const nonEmpty = (s: string | null | undefined) => typeof s === "string" && s.trim() !== "";

/**
 * Turns a stays row (+ child relations, possibly absent for legacy stays) into one
 * shape the page can render. Legacy `images` / `amenities` arrays are used only
 * when the relational tables have nothing for the stay.
 */
export function normalizeStay(
  raw: RawStayRow,
  opts: { includeInactive?: boolean } = {}
): StayProfile {
  const keep = <T extends { is_active: boolean }>(rows: T[]) =>
    opts.includeInactive ? rows : rows.filter((r) => r.is_active);

  const relationalGallery: GalleryImage[] = bySort(raw.stay_images)
    .filter((i) => nonEmpty(i.image_url))
    .map((i) => ({ id: i.id, url: i.image_url, type: i.image_type, caption: i.caption }));
  const gallery: GalleryImage[] =
    relationalGallery.length > 0
      ? relationalGallery
      : (raw.images ?? [])
          .map((url, i) => ({ url, i }))
          .filter(({ url }) => nonEmpty(url))
          .map(({ url, i }) => ({ id: `legacy-${i}`, url, type: "other", caption: null }));

  const relationalAmenities: Amenity[] = bySort(raw.stay_amenities)
    .filter((a) => nonEmpty(a.name))
    .map((a) => ({ id: a.id, name: a.name.trim(), category: a.category, icon: a.icon }));
  const amenities: Amenity[] =
    relationalAmenities.length > 0
      ? relationalAmenities
      : (raw.amenities ?? [])
          .map((name, i) => ({ name: (name ?? "").trim(), i }))
          .filter(({ name }) => name !== "")
          .map(({ name, i }) => ({
            id: `legacy-${i}`,
            name,
            category: categoryFor(STAY_AMENITY_CATALOG, name),
            icon: null,
          }));

  const rooms: Room[] = keep(bySort(raw.rooms)).map((r) => ({
    ...r,
    price_per_night: toNum(r.price_per_night),
    original_price: toNum(r.original_price),
    max_guests: toNum(r.max_guests),
    room_images: bySort(r.room_images).filter((i) => nonEmpty(i.image_url)),
    room_amenities: bySort(r.room_amenities).map((a) => ({
      id: a.id, name: a.name, category: a.category, icon: a.icon,
    })),
    room_rate_plans: keep(bySort(r.room_rate_plans)).map((p) => ({
      ...p,
      price_per_night: toNum(p.price_per_night),
    })),
  }));

  const reviews = keep(bySort(raw.stay_reviews)).map((r) => ({
    ...r,
    rating: toNum(r.rating) ?? 0,
    cleanliness_rating: toNum(r.cleanliness_rating),
    location_rating: toNum(r.location_rating),
    hospitality_rating: toNum(r.hospitality_rating),
    facilities_rating: toNum(r.facilities_rating),
    value_rating: toNum(r.value_rating),
  }));

  const sections: Section[] = keep(bySort(raw.stay_sections))
    .filter((s) => (SECTION_TYPES as readonly string[]).includes(s.type))
    .map((s) => ({ ...s, type: s.type as SectionType }));

  const policies = Array.isArray(raw.stay_policies)
    ? raw.stay_policies[0] ?? null
    : raw.stay_policies ?? null;

  const cover = nonEmpty(raw.cover_image) ? raw.cover_image : null;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    short_description: raw.short_description ?? null,
    property_type: raw.property_type ?? null,
    address: raw.address,
    destination_id: raw.destination_id,
    destination: raw.destinations
      ? { name: raw.destinations.name, state: raw.destinations.state, slug: raw.destinations.slug ?? null }
      : null,
    cover_image: cover,
    heroImage: cover ?? gallery[0]?.url ?? null,
    gallery,
    amenities,
    sections,
    rooms,
    reviews,
    faqs: bySort(raw.stay_faqs),
    policies,
    nearby: bySort(raw.stay_nearby_places).map((n) => ({ ...n, distance_km: toNum(n.distance_km) })),
    latitude: toNum(raw.latitude),
    longitude: toNum(raw.longitude),
    google_place_id: raw.google_place_id?.trim() || null,
    check_in_time: raw.check_in_time ?? null,
    check_out_time: raw.check_out_time ?? null,
    price_per_night: toNum(raw.price_per_night),
    rating: toNum(raw.rating) ?? 0,
    review_count: toNum(raw.review_count) ?? 0,
    is_featured: raw.is_featured,
    is_published: raw.is_published ?? true,
    seo_title: raw.seo_title ?? null,
    seo_description: raw.seo_description ?? null,
    og_image: raw.og_image ?? null,
    updated_at: raw.updated_at,
  };
}

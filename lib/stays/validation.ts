/**
 * Parsers for Stay Builder payloads. Everything arriving from the browser is untrusted:
 * these whitelist fields, coerce types and reject values the database or the public
 * page should never see (unsafe URLs, fake discounts, out-of-range ratings).
 */
import { amenityKey, OTHER_CATEGORY } from "@/lib/stays/amenity-catalog";
import { ROOM_IMAGE_TYPES, SECTION_TYPES, STAY_IMAGE_TYPES, type SectionType } from "@/lib/stays/types";

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };
type Raw = Record<string, unknown>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_SRC = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const FOLDER_RE = new RegExp(`^${UUID_SRC}/(cover|gallery|story|reviews|seo|rooms/${UUID_SRC})$`, "i");

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);
export const isValidUploadFolder = (folder: string) => FOLDER_RE.test(folder);

export const str = (v: unknown): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  return s || null;
};
export const num = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined || typeof v === "boolean") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const nonNegative = (v: unknown) => {
  const n = num(v);
  return n !== null && n >= 0 ? n : null;
};
const rating = (v: unknown) => {
  const n = num(v);
  return n !== null && n >= 1 && n <= 5 ? Math.round(n * 10) / 10 : null;
};
const uuidOrNull = (v: unknown) => (isUuid(v) ? v : null);
export const list = (v: unknown): Raw[] =>
  Array.isArray(v) ? v.filter((x): x is Raw => typeof x === "object" && x !== null) : [];

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** https URLs and site-relative paths only — blocks javascript:, data:, http: and //host. */
export function safeImageUrl(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    return new URL(s).protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

// ---------- Stay ----------

export interface StayBasics {
  name: string; slug: string; destination_id: string | null; property_type: string | null;
  short_description: string | null; description: string | null; address: string | null;
  is_featured: boolean; is_published: boolean; price_per_night: number | null;
}

export function parseStayBasics(p: Raw): Parsed<StayBasics> {
  const name = str(p.name);
  const slug = slugify(str(p.slug) ?? "");
  if (!name || !slug) return { ok: false, error: "Name and slug are required." };
  return {
    ok: true,
    value: {
      name,
      slug,
      destination_id: uuidOrNull(p.destination_id),
      property_type: str(p.property_type),
      short_description: str(p.short_description),
      description: str(p.description),
      address: str(p.address),
      is_featured: p.is_featured === true,
      is_published: p.is_published === true,
      price_per_night: nonNegative(p.price_per_night),
    },
  };
}

export function parseCoordinates(lat: unknown, lng: unknown): Parsed<{ latitude: number | null; longitude: number | null }> {
  const la = num(lat);
  const lo = num(lng);
  if (la === null && lo === null) return { ok: true, value: { latitude: null, longitude: null } };
  if (la === null || lo === null) return { ok: false, error: "Enter both latitude and longitude, or neither." };
  if (Math.abs(la) > 90 || Math.abs(lo) > 180) return { ok: false, error: "Coordinates are out of range." };
  return { ok: true, value: { latitude: la, longitude: lo } };
}

// ---------- Collections ----------

export interface AmenityValue { id: string; name: string; category: string; icon: string | null }

export function parseAmenities(v: unknown): AmenityValue[] {
  const seen = new Set<string>();
  const out: AmenityValue[] = [];
  for (const a of list(v)) {
    const name = str(a.name);
    if (!isUuid(a.id) || !name) continue;
    const key = amenityKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: a.id, name, category: str(a.category) ?? OTHER_CATEGORY, icon: str(a.icon) });
  }
  return out;
}

export interface ImageValue { id: string; image_url: string; image_type: string; caption: string | null }

/** `kind` selects the allowed image categories: room galleries vs the stay gallery. */
export function parseImages(v: unknown, kind: "room" | "stay"): ImageValue[] {
  const allowed: readonly string[] = kind === "room" ? ROOM_IMAGE_TYPES : STAY_IMAGE_TYPES;
  const fallback = kind === "room" ? "room" : "other";
  return list(v).flatMap((i) => {
    const url = safeImageUrl(i.image_url);
    if (!isUuid(i.id) || !url) return [];
    const type = typeof i.image_type === "string" && allowed.includes(i.image_type) ? i.image_type : fallback;
    return [{ id: i.id, image_url: url, image_type: type, caption: str(i.caption) }];
  });
}

// ---------- Rooms ----------

export interface RoomValue {
  name: string; slug: string; description: string | null; price_per_night: number | null;
  original_price: number | null; max_guests: number | null; bed_type: string | null;
  room_size: string | null; view: string | null; is_active: boolean;
}

export function parseRoom(p: Raw): Parsed<RoomValue> {
  const name = str(p.name);
  if (!name) return { ok: false, error: "Room name is required." };
  const slug = slugify(str(p.slug) ?? name);
  if (!slug) return { ok: false, error: "Room slug is required." };
  const price = nonNegative(p.price_per_night);
  const original = nonNegative(p.original_price);
  const guests = num(p.max_guests);
  const wholeGuests = guests === null ? null : Math.floor(guests);
  return {
    ok: true,
    value: {
      name,
      slug,
      description: str(p.description),
      price_per_night: price,
      // A "was" price is shown as a strike-through, so only keep it when it's genuinely higher.
      original_price: price !== null && original !== null && original > price ? original : null,
      max_guests: wholeGuests !== null && wholeGuests >= 1 && wholeGuests <= 50 ? wholeGuests : null,
      bed_type: str(p.bed_type),
      room_size: str(p.room_size),
      view: str(p.view),
      is_active: p.is_active !== false,
    },
  };
}

export interface RatePlanValue {
  id: string; name: string; price_per_night: number | null; meal_plan: string | null;
  cancellation_policy: string | null; payment_policy: string | null; is_active: boolean;
}

export function parseRatePlans(v: unknown): RatePlanValue[] {
  return list(v).flatMap((r) => {
    const name = str(r.name);
    if (!isUuid(r.id) || !name) return [];
    return [{
      id: r.id,
      name,
      price_per_night: nonNegative(r.price_per_night),
      meal_plan: str(r.meal_plan),
      cancellation_policy: str(r.cancellation_policy),
      payment_policy: str(r.payment_policy),
      is_active: r.is_active !== false,
    }];
  });
}

// ---------- Reviews ----------

export interface ReviewValue {
  id: string; room_id: string | null; reviewer_name: string; rating: number; review_text: string;
  traveller_type: string | null; stayed_on: string | null; reviewer_image: string | null; guest_photo: string | null;
  cleanliness_rating: number | null; location_rating: number | null; hospitality_rating: number | null;
  facilities_rating: number | null; value_rating: number | null; is_highlight: boolean; is_active: boolean;
}

const isoDate = (v: unknown): string | null => {
  const s = str(v);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return Number.isNaN(new Date(`${s}T00:00:00Z`).getTime()) ? null : s;
};

export function parseReview(r: Raw): Parsed<ReviewValue> {
  const name = str(r.reviewer_name);
  const text = str(r.review_text);
  const score = rating(r.rating);
  if (!isUuid(r.id)) return { ok: false, error: "Invalid review id." };
  if (!name || !text || score === null) {
    return { ok: false, error: "Each review needs a reviewer name, a 1–5 rating and review text." };
  }
  return {
    ok: true,
    value: {
      id: r.id,
      room_id: uuidOrNull(r.room_id),
      reviewer_name: name,
      rating: score,
      review_text: text,
      traveller_type: str(r.traveller_type),
      stayed_on: isoDate(r.stayed_on),
      reviewer_image: safeImageUrl(r.reviewer_image),
      guest_photo: safeImageUrl(r.guest_photo),
      cleanliness_rating: rating(r.cleanliness_rating),
      location_rating: rating(r.location_rating),
      hospitality_rating: rating(r.hospitality_rating),
      facilities_rating: rating(r.facilities_rating),
      value_rating: rating(r.value_rating),
      is_highlight: r.is_highlight === true,
      is_active: r.is_active !== false,
    },
  };
}

// ---------- Story sections ----------

export interface SectionValue {
  id: string; type: SectionType; title: string | null; subtitle: string | null; body: string | null;
  image_url: string | null; review_id: string | null; room_id: string | null; is_active: boolean;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  image: "Image", story: "Story", quote: "Quote", review: "Guest review", room: "Room",
  gallery: "Gallery", experience: "Experience", amenities: "Amenities", location: "Location",
};

export function parseSection(s: Raw): Parsed<SectionValue> {
  if (!isUuid(s.id)) return { ok: false, error: "Invalid section id." };
  if (typeof s.type !== "string" || !(SECTION_TYPES as readonly string[]).includes(s.type)) {
    return { ok: false, error: "Unknown section type." };
  }
  const type = s.type as SectionType;
  const value: SectionValue = {
    id: s.id,
    type,
    title: str(s.title),
    subtitle: str(s.subtitle),
    body: str(s.body),
    image_url: safeImageUrl(s.image_url),
    review_id: type === "review" ? uuidOrNull(s.review_id) : null,
    room_id: type === "room" ? uuidOrNull(s.room_id) : null,
    is_active: s.is_active !== false,
  };
  const label = SECTION_LABELS[type];
  if (type === "image" && !value.image_url) return { ok: false, error: `${label} sections need an image.` };
  if (type === "review" && !value.review_id) return { ok: false, error: "Choose which review to feature." };
  if (type === "room" && !value.room_id) return { ok: false, error: "Choose which room to feature." };
  if ((type === "story" || type === "quote" || type === "experience") && !value.title && !value.body) {
    return { ok: false, error: `${label} sections need a title or text.` };
  }
  return { ok: true, value };
}

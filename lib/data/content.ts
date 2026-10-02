import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizeStay } from "@/lib/stays/normalize";
import { STAY_FULL_SELECT, type RawStayRow, type StayProfile } from "@/lib/stays/types";
import type {
  Destination,
  Stay,
  Experience,
  RoadTripChapter,
  TravelStory,
  GalleryImage,
  MapRoute,
} from "@/lib/types/database";

/**
 * Wraps a Supabase query so network errors (DNS failures, timeouts,
 * paused projects) don't crash the page — they return a fallback
 * instead so the UI renders fast with empty data.
 */
async function safeQuery<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T
): Promise<T> {
  try {
    const { data } = await fn();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getPopularDestinations(): Promise<Destination[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("destinations")
        .select("*")
        .eq("is_popular", true)
        .order("sort_order", { ascending: true }),
    []
  );
}

export async function getAllDestinations(): Promise<Destination[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("destinations")
        .select("*")
        .order("sort_order", { ascending: true }),
    []
  );
}

export async function getDestinationBySlug(
  slug: string
): Promise<Destination | null> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .single(),
    null
  );
}

export async function getFeaturedStays(): Promise<Stay[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("stays")
        .select("*, destinations(name, state)")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false }),
    []
  );
}

export async function getAllStays(): Promise<Stay[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("stays")
        .select("*, destinations(name, state)")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
    []
  );
}

export async function getStaysByDestination(
  destinationId: string
): Promise<Stay[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("stays")
        .select("*, destinations(name, state)")
        .eq("is_published", true)
        .eq("destination_id", destinationId)
        .order("created_at", { ascending: false }),
    []
  );
}

/** Full published stay profile for the public page (cookie-less, so the page can be cached). */
// cache(): generateMetadata and the page share one query per request.
export const getPublishedStay = cache(async (slug: string): Promise<StayProfile | null> => {
  const supabase = createPublicClient();
  const raw = await safeQuery<RawStayRow | null>(
    () =>
      supabase
        .from("stays")
        .select(STAY_FULL_SELECT)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle(),
    null
  );
  return raw ? normalizeStay(raw) : null;
});

export async function getPublishedStaySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = createPublicClient();
  return safeQuery(
    () => supabase.from("stays").select("slug, updated_at").eq("is_published", true),
    []
  );
}

export async function getExperiences(): Promise<Experience[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("experiences")
        .select("*")
        .order("sort_order", { ascending: true }),
    []
  );
}

export async function getRoadTripChapters(): Promise<RoadTripChapter[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("road_trip_chapters")
        .select("*")
        .order("step_number", { ascending: true }),
    []
  );
}

export async function getRoadTripChapterBySlug(
  slug: string
): Promise<RoadTripChapter | null> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("road_trip_chapters")
        .select("*")
        .eq("slug", slug)
        .single(),
    null
  );
}

export async function getApprovedStories(limit?: number): Promise<TravelStory[]> {
  const supabase = await createClient();
  return safeQuery(async () => {
    let query = supabase
      .from("travel_stories")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    return query;
  }, []);
}

export async function getStoryBySlug(slug: string): Promise<TravelStory | null> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("travel_stories")
        .select("*")
        .eq("slug", slug)
        .eq("status", "approved")
        .single(),
    null
  );
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true }),
    []
  );
}

export async function getMapRoutes(): Promise<MapRoute[]> {
  const supabase = await createClient();
  return safeQuery(
    () =>
      supabase
        .from("map_routes")
        .select("*")
        .order("sort_order", { ascending: true }),
    []
  );
}

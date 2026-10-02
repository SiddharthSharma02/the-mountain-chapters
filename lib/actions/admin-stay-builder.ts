"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/storage/upload";
import {
  isUuid,
  isValidUploadFolder,
  list,
  num,
  parseAmenities,
  parseCoordinates,
  parseImages,
  parseRatePlans,
  parseReview,
  parseRoom,
  parseSection,
  parseStayBasics,
  safeImageUrl,
  str,
} from "@/lib/stays/validation";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };
type Client = Awaited<ReturnType<typeof createClient>>;
type Raw = Record<string, unknown>;

/** Defense in depth: the proxy, the dashboard layout and RLS already gate admins. */
async function requireAdmin(): Promise<Client> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  if (data !== true) throw new Error("Not authorised.");
  return supabase;
}

async function guard<T>(fn: (s: Client) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn(await requireAdmin());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * Makes `table` rows for one parent exactly match `rows` (client-generated uuids):
 * upserts in the given order (sort_order = index) and deletes rows that were removed.
 */
async function syncRows<T extends { id: string }>(
  supabase: Client,
  table: string,
  parentCol: string,
  parentId: string,
  rows: T[]
) {
  const ids = rows.map((r) => r.id);
  if (ids.length > 0) {
    // Refuse ids that belong to another parent — an upsert would silently move them.
    const { data: foreign, error } = await supabase
      .from(table).select("id").in("id", ids).neq(parentCol, parentId).limit(1);
    fail(error);
    if (foreign && foreign.length > 0) throw new Error("Item belongs to a different record.");
    const { error: upErr } = await supabase
      .from(table)
      .upsert(rows.map((r, i) => ({ ...r, [parentCol]: parentId, sort_order: i })));
    fail(upErr);
  }
  let del = supabase.from(table).delete().eq(parentCol, parentId);
  if (ids.length > 0) del = del.not("id", "in", `(${ids.join(",")})`);
  const { error: delErr } = await del;
  fail(delErr);
}

async function revalidateStay(supabase: Client, stayId: string, extraSlugs: string[] = []) {
  const { data } = await supabase.from("stays").select("slug").eq("id", stayId).maybeSingle();
  for (const slug of new Set([data?.slug, ...extraSlugs].filter(Boolean))) revalidatePath(`/stays/${slug}`);
  revalidatePath("/stays");
  revalidatePath("/");
  revalidatePath("/admin/stays");
  revalidatePath(`/admin/stays/${stayId}`, "layout");
}

function assertStayId(stayId: string) {
  if (!isUuid(stayId)) throw new Error("Invalid stay id.");
}

// ---------- Uploads ----------
// Same rules as every other admin upload (lib/storage/upload.ts): 3MB, image MIME,
// sanitised unique filename. Paths are organised as stays/{stayId}/{cover|gallery|...}.

export async function uploadStayImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return guard(async () => {
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "");
    if (!(file instanceof File)) throw new Error("No file received.");
    if (!isValidUploadFolder(folder)) throw new Error("Invalid upload folder.");
    return { ok: true, url: await uploadImage(file, "stays", folder) };
  });
}

// ---------- Basics ----------

export async function saveStayBasics(stayId: string | null, p: Raw): Promise<ActionResult<{ id: string }>> {
  return guard(async (supabase) => {
    const parsed = parseStayBasics(p);
    if (!parsed.ok) throw new Error(parsed.error);
    // Publishing is a separate, explicit action (setStayPublished); new stays start as drafts.
    const { is_published: _ignored, ...basics } = parsed.value;
    const slugError = (msg: string) => (msg.includes("stays_slug_key") ? "That slug is already used by another stay." : msg);

    if (stayId) {
      assertStayId(stayId);
      const { data: before } = await supabase.from("stays").select("slug").eq("id", stayId).maybeSingle();
      const { error } = await supabase
        .from("stays")
        .update({ ...basics, updated_at: new Date().toISOString() })
        .eq("id", stayId);
      if (error) throw new Error(slugError(error.message));
      await revalidateStay(supabase, stayId, before?.slug ? [before.slug] : []);
      return { ok: true, id: stayId };
    }

    const { data, error } = await supabase
      .from("stays")
      .insert({ ...basics, is_published: false })
      .select("id")
      .single();
    if (error) throw new Error(slugError(error.message));
    await revalidateStay(supabase, data.id);
    return { ok: true, id: data.id as string };
  });
}

export async function setStayPublished(stayId: string, published: boolean): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    fail((await supabase.from("stays").update({ is_published: published === true }).eq("id", stayId)).error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Media ----------

export async function saveStayMedia(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const images = parseImages(p.images, "stay");
    await syncRows(supabase, "stay_images", "stay_id", stayId, images);
    // Keep the legacy columns in sync so listing cards and older readers keep working.
    fail(
      (await supabase
        .from("stays")
        .update({ cover_image: safeImageUrl(p.cover_image), images: images.map((i) => i.image_url) })
        .eq("id", stayId)).error
    );
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Amenities ----------

export async function saveStayAmenities(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const rows = parseAmenities(p.amenities);
    await syncRows(supabase, "stay_amenities", "stay_id", stayId, rows);
    fail((await supabase.from("stays").update({ amenities: rows.map((r) => r.name) }).eq("id", stayId)).error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Story ----------

export async function saveStaySections(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const rows = list(p.sections).map((s, i) => {
      const parsed = parseSection(s);
      if (!parsed.ok) throw new Error(`Section ${i + 1}: ${parsed.error}`);
      return parsed.value;
    });
    // Featured reviews/rooms must belong to this stay.
    const [{ data: reviews }, { data: rooms }] = await Promise.all([
      supabase.from("stay_reviews").select("id").eq("stay_id", stayId),
      supabase.from("rooms").select("id").eq("stay_id", stayId),
    ]);
    const reviewIds = new Set((reviews ?? []).map((r) => r.id));
    const roomIds = new Set((rooms ?? []).map((r) => r.id));
    rows.forEach((s, i) => {
      if (s.review_id && !reviewIds.has(s.review_id)) throw new Error(`Section ${i + 1}: save the review first.`);
      if (s.room_id && !roomIds.has(s.room_id)) throw new Error(`Section ${i + 1}: that room no longer exists.`);
    });
    await syncRows(supabase, "stay_sections", "stay_id", stayId, rows);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Reviews ----------

export async function saveStayReviews(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const rows = list(p.reviews).map((r, i) => {
      const parsed = parseReview(r);
      if (!parsed.ok) throw new Error(`Review ${i + 1}: ${parsed.error}`);
      return parsed.value;
    });
    await syncRows(supabase, "stay_reviews", "stay_id", stayId, rows);

    // The stays.rating/review_count summary feeds listing cards. Once real reviews exist it is
    // derived from them; before that, the admin-entered summary (e.g. from another platform) is kept.
    const active = rows.filter((r) => r.is_active);
    const summary =
      active.length > 0
        ? {
            rating: Math.round((active.reduce((a, r) => a + r.rating, 0) / active.length) * 10) / 10,
            review_count: active.length,
          }
        : {
            rating: Math.min(5, Math.max(0, num(p.rating) ?? 0)),
            review_count: Math.max(0, Math.floor(num(p.review_count) ?? 0)),
          };
    fail((await supabase.from("stays").update(summary).eq("id", stayId)).error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Location ----------

export async function saveStayLocation(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const coords = parseCoordinates(p.latitude, p.longitude);
    if (!coords.ok) throw new Error(coords.error);
    const googlePlaceId = str(p.google_place_id);
    if (googlePlaceId && googlePlaceId.length > 255) throw new Error("Google Place ID is too long.");
    fail((await supabase.from("stays").update({ ...coords.value, google_place_id: googlePlaceId }).eq("id", stayId)).error);
    const places = list(p.places).flatMap((n) => {
      const name = str(n.name);
      const km = num(n.distance_km);
      return isUuid(n.id) && name ? [{ id: n.id, name, distance_km: km !== null && km >= 0 ? km : null }] : [];
    });
    await syncRows(supabase, "stay_nearby_places", "stay_id", stayId, places);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Policies + FAQs ----------

export async function saveStayPolicies(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    fail(
      (await supabase
        .from("stays")
        .update({ check_in_time: str(p.check_in_time), check_out_time: str(p.check_out_time) })
        .eq("id", stayId)).error
    );
    fail(
      (await supabase.from("stay_policies").upsert({
        stay_id: stayId,
        pets: str(p.pets),
        smoking: str(p.smoking),
        children: str(p.children),
        cancellation_policy: str(p.cancellation_policy),
        extra_rules: str(p.extra_rules),
      })).error
    );
    const faqs = list(p.faqs).flatMap((f) => {
      const question = str(f.question);
      const answer = str(f.answer);
      return isUuid(f.id) && question && answer ? [{ id: f.id, question, answer }] : [];
    });
    await syncRows(supabase, "stay_faqs", "stay_id", stayId, faqs);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- SEO ----------

export async function saveStaySeo(stayId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    fail(
      (await supabase
        .from("stays")
        .update({ seo_title: str(p.seo_title), seo_description: str(p.seo_description), og_image: safeImageUrl(p.og_image) })
        .eq("id", stayId)).error
    );
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

// ---------- Rooms ----------

export async function saveRoom(stayId: string, roomId: string, p: Raw): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    if (!isUuid(roomId)) throw new Error("Invalid room id.");
    const parsed = parseRoom(p);
    if (!parsed.ok) throw new Error(parsed.error);

    const { data: existing, error: exErr } = await supabase
      .from("rooms").select("id, stay_id").eq("id", roomId).maybeSingle();
    fail(exErr);
    if (existing && existing.stay_id !== stayId) throw new Error("Room belongs to a different stay.");

    let sortOrder: number | undefined;
    if (!existing) {
      const { count } = await supabase.from("rooms").select("id", { count: "exact", head: true }).eq("stay_id", stayId);
      sortOrder = count ?? 0;
    }
    const { error } = await supabase.from("rooms").upsert({
      id: roomId,
      stay_id: stayId,
      ...parsed.value,
      updated_at: new Date().toISOString(),
      ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
    });
    if (error) {
      throw new Error(error.message.includes("rooms_stay_id_slug_key") ? "Another room in this stay already uses that slug." : error.message);
    }

    await syncRows(
      supabase, "room_images", "room_id", roomId,
      parseImages(p.images, "room").map(({ caption: _c, ...img }) => img)
    );
    await syncRows(supabase, "room_amenities", "room_id", roomId, parseAmenities(p.amenities));
    await syncRows(supabase, "room_rate_plans", "room_id", roomId, parseRatePlans(p.rate_plans));
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

export async function deleteRoom(stayId: string, roomId: string): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    fail((await supabase.from("rooms").delete().eq("id", roomId).eq("stay_id", stayId)).error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

export async function setRoomActive(stayId: string, roomId: string, active: boolean): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    fail((await supabase.from("rooms").update({ is_active: active === true }).eq("id", roomId).eq("stay_id", stayId)).error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

export async function reorderRooms(stayId: string, ids: string[]): Promise<ActionResult> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    if (!Array.isArray(ids) || !ids.every(isUuid)) throw new Error("Invalid room order.");
    const results = await Promise.all(
      ids.map((id, i) => supabase.from("rooms").update({ sort_order: i }).eq("id", id).eq("stay_id", stayId))
    );
    for (const r of results) fail(r.error);
    await revalidateStay(supabase, stayId);
    return { ok: true };
  });
}

export async function duplicateRoom(stayId: string, roomId: string): Promise<ActionResult<{ id: string }>> {
  return guard(async (supabase) => {
    assertStayId(stayId);
    const { data: room, error } = await supabase
      .from("rooms")
      .select("*, room_images(*), room_amenities(*), room_rate_plans(*)")
      .eq("id", roomId)
      .eq("stay_id", stayId)
      .single();
    if (error || !room) throw new Error(error?.message ?? "Room not found.");

    const newId = crypto.randomUUID();
    const { count } = await supabase.from("rooms").select("id", { count: "exact", head: true }).eq("stay_id", stayId);
    const { room_images, room_amenities, room_rate_plans, id: _id, created_at: _c, updated_at: _u, ...base } = room;
    fail(
      (await supabase.from("rooms").insert({
        ...base,
        id: newId,
        name: `${room.name} (copy)`,
        slug: `${room.slug}-copy-${newId.slice(0, 6)}`,
        // Copies start hidden so a half-edited duplicate never appears publicly.
        is_active: false,
        sort_order: count ?? 0,
      })).error
    );
    const clone = async (table: string, rows: Raw[]) => {
      if (!rows?.length) return;
      fail(
        (await supabase.from(table).insert(
          rows.map(({ id: _i, created_at: _ca, ...r }) => ({ ...r, id: crypto.randomUUID(), room_id: newId }))
        )).error
      );
    };
    await clone("room_images", room_images);
    await clone("room_amenities", room_amenities);
    await clone("room_rate_plans", room_rate_plans);
    await revalidateStay(supabase, stayId);
    return { ok: true, id: newId };
  });
}

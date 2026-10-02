"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function parseForm(formData: FormData) {
  const routeRaw = String(formData.get("route") || "").trim();
  const route = routeRaw
    ? routeRaw.split(",").map((name) => ({ name: name.trim() }))
    : [];

  const coverFile = formData.get("cover_image_file") as File | null;
  const coverUrl = String(formData.get("cover_image_url") || "").trim() || null;

  let cover_image = coverUrl;
  if (coverFile && coverFile.size > 0) {
    cover_image = await uploadImage(coverFile, "road-trips");
  }

  return {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    step_number: Number(formData.get("step_number") || 0),
    cover_image,
    distance_km: formData.get("distance_km")
      ? Number(formData.get("distance_km"))
      : null,
    duration_days: formData.get("duration_days")
      ? Number(formData.get("duration_days"))
      : null,
    route,
  };
}

export async function createRoadTripChapter(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("road_trip_chapters")
    .insert(await parseForm(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/road-trips");
  revalidatePath("/road-trips");
  revalidatePath("/");
  redirect("/admin/road-trips");
}

export async function updateRoadTripChapter(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("road_trip_chapters")
    .update(await parseForm(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/road-trips");
  revalidatePath("/road-trips");
  revalidatePath("/");
  redirect("/admin/road-trips");
}

export async function deleteRoadTripChapter(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("road_trip_chapters")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/road-trips");
  revalidatePath("/road-trips");
  revalidatePath("/");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseForm(formData: FormData) {
  const pointsRaw = String(formData.get("points") || "").trim();
  const points = pointsRaw
    ? pointsRaw.split(",").map((name) => ({ name: name.trim() }))
    : [];

  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    points,
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createMapRoute(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("map_routes").insert(parseForm(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/routes");
  revalidatePath("/");
  redirect("/admin/routes");
}

export async function updateMapRoute(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("map_routes")
    .update(parseForm(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/routes");
  revalidatePath("/");
  redirect("/admin/routes");
}

export async function deleteMapRoute(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("map_routes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/routes");
  revalidatePath("/");
}

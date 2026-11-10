"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
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

export async function createMapRoute(formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase.from("map_routes").insert(parseForm(formData));
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/routes");
  revalidatePath("/");
  redirect("/admin/routes");
}

export async function updateMapRoute(id: string, formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("map_routes")
      .update(parseForm(formData))
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/routes");
  revalidatePath("/");
  redirect("/admin/routes");
}

export async function deleteMapRoute(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase.from("map_routes").delete().eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/routes");
  revalidatePath("/");
  return undefined;
}

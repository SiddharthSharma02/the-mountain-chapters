"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
import { uploadImage } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function parseForm(formData: FormData) {
  const coverFile = formData.get("cover_image_file") as File | null;
  const coverUrl = String(formData.get("cover_image_url") || "").trim() || null;

  let cover_image = coverUrl;
  if (coverFile && coverFile.size > 0) {
    cover_image = await uploadImage(coverFile, "destinations");
  }

  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    state: String(formData.get("state") || "").trim() || null,
    tagline: String(formData.get("tagline") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    cover_image,
    is_popular: formData.get("is_popular") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createDestination(formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const values = await parseForm(formData);
    const { error } = await supabase.from("destinations").insert(values);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  redirect("/admin/destinations");
}

export async function updateDestination(id: string, formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const values = await parseForm(formData);
    const { error } = await supabase
      .from("destinations")
      .update(values)
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  redirect("/admin/destinations");
}

export async function deleteDestination(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return undefined;
}

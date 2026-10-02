"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function parseForm(formData: FormData) {
  const coverFile = formData.get("cover_image_file") as File | null;
  const coverUrl = String(formData.get("cover_image_url") || "").trim() || null;

  let cover_image = coverUrl;
  if (coverFile && coverFile.size > 0) {
    cover_image = await uploadImage(coverFile, "experiences");
  }

  return {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    icon: String(formData.get("icon") || "").trim() || null,
    cover_image,
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createExperience(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .insert(await parseForm(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  redirect("/admin/experiences");
}

export async function updateExperience(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .update(await parseForm(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  redirect("/admin/experiences");
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
}

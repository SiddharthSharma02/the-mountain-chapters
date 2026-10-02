"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function parseForm(formData: FormData) {
  const imageFile = formData.get("image_file") as File | null;
  const imageUrl = String(formData.get("image_url") || "").trim() || null;

  let image_url = imageUrl;
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadImage(imageFile, "gallery");
  }

  if (!image_url) {
    throw new Error("Please provide an image file or image URL.");
  }

  return {
    image_url,
    caption: String(formData.get("caption") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createGalleryImage(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_images")
    .insert(await parseForm(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryImage(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_images")
    .update(await parseForm(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

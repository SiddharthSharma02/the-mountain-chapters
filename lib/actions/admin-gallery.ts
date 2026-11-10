"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
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

export async function createGalleryImage(formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("gallery_images")
      .insert(await parseForm(formData));
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryImage(id: string, formData: FormData): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("gallery_images")
      .update(await parseForm(formData))
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return undefined;
}

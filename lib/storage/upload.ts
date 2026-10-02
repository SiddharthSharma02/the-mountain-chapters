import "server-only";

import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

function sanitizeFileName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const [baseName, ext = ""] = base.split(/\.(?=[^.]+$)/);
  return baseName ? `${baseName}${ext ? `.${ext}` : ""}` : "image";
}

export async function uploadImage(
  file: File,
  bucket: string,
  folder?: string
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be smaller than 3MB.");
  }

  const supabase = await createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = sanitizeFileName(file.name) || `image.${ext}`;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 10);
  const folderPath = folder ? `${folder}/` : "";
  const path = `${folderPath}${timestamp}-${randomId}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      // Paths are unique per upload, so the object never changes: cache for a year.
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl.publicUrl;
}

export async function uploadImages(
  files: File[],
  bucket: string,
  folder?: string
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file, bucket, folder)));
}

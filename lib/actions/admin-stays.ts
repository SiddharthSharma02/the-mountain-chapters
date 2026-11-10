"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
import { revalidatePath } from "next/cache";

export async function deleteStay(id: string): Promise<AdminResult> {
  let slug: string | null = null;
  const result = await adminMutation(async (supabase) => {
    const { data: stay } = await supabase.from("stays").select("slug").eq("id", id).maybeSingle();
    slug = stay?.slug ?? null;
    // Rooms, images, sections, reviews etc. are removed by ON DELETE CASCADE.
    const { error } = await supabase.from("stays").delete().eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/stays");
  revalidatePath("/stays");
  if (slug) revalidatePath(`/stays/${slug}`);
  revalidatePath("/");
  return undefined;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteStay(id: string) {
  const supabase = await createClient();
  const { data: stay } = await supabase.from("stays").select("slug").eq("id", id).maybeSingle();
  // Rooms, images, sections, reviews etc. are removed by ON DELETE CASCADE.
  const { error } = await supabase.from("stays").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stays");
  revalidatePath("/stays");
  if (stay?.slug) revalidatePath(`/stays/${stay.slug}`);
  revalidatePath("/");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StoryStatus } from "@/lib/types/database";

export async function setStoryStatus(id: string, status: StoryStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("travel_stories")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath("/");
}

export async function deleteStory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("travel_stories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath("/");
}

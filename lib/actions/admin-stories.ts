"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
import { revalidatePath } from "next/cache";
import type { StoryStatus } from "@/lib/types/database";

export async function setStoryStatus(id: string, status: StoryStatus): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("travel_stories")
      .update({ status })
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath("/");
  return undefined;
}

export async function deleteStory(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("travel_stories")
      .delete()
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  revalidatePath("/");
  return undefined;
}

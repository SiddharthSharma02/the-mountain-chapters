"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
import { revalidatePath } from "next/cache";
import type { MessageStatus } from "@/lib/types/database";

export async function setMessageStatus(id: string, status: MessageStatus): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/messages");
  return undefined;
}

export async function deleteMessage(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/messages");
  return undefined;
}

export async function deleteSubscriber(id: string): Promise<AdminResult> {
  const result = await adminMutation(async (supabase) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/subscribers");
  return undefined;
}

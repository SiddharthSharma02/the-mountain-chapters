"use server";

import { adminMutation, check, type AdminResult } from "@/lib/auth/admin-mutation";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData): Promise<AdminResult> {
  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "").trim() === "admin" ? "admin" : "user";

  if (!id) return { error: "User ID is required." };

  const result = await adminMutation(async (supabase) => {
    const { data } = await supabase.auth.getUser();
    // Stop an admin from locking themselves out by removing their own admin role.
    if (role !== "admin" && id === data.user?.id) throw new Error("You can't remove your own admin role.");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null, phone: phone || null, role })
      .eq("id", id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/users");
  return undefined;
}

export async function deleteUserProfile(id: string): Promise<AdminResult> {
  // adminMutation checks the caller is an admin before the service-role client
  // (which skips every database rule) is ever created.
  const result = await adminMutation(async (supabase) => {
    const { data } = await supabase.auth.getUser();
    if (id === data.user?.id) throw new Error("You can't delete your own account here.");
    // Deleting the auth user cascades to public.profiles (on delete cascade).
    const { error } = await createAdminClient().auth.admin.deleteUser(id);
    check(error);
  });
  if (result) return result;
  revalidatePath("/admin/users");
  return undefined;
}

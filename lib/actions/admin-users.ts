"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!id) {
    throw new Error("User ID is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      role: role === "admin" ? "admin" : "user",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function deleteUserProfile(id: string) {
  const admin = createAdminClient();

  // Deleting the auth user cascades to the public.profiles row
  // because of the foreign key with on delete cascade.
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

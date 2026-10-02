"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactMessage(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone: phone || null,
    message,
  });

  if (error) {
    return { success: false, message: "Something went wrong. Try again." };
  }

  return {
    success: true,
    message: "Thanks for reaching out! We'll get back to you soon.",
  };
}

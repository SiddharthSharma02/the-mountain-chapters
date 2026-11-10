"use server";

import { createClient } from "@/lib/supabase/server";
import { isLikelySpam, isValidEmail } from "@/lib/spam";

export async function subscribeToNewsletter(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (isLikelySpam(formData)) {
    return { success: true, message: "Thanks for subscribing!" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "You're already subscribed!" };
    }
    return { success: false, message: "Something went wrong. Try again." };
  }

  return { success: true, message: "Thanks for subscribing!" };
}

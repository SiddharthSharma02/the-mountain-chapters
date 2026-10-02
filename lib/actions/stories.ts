"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function submitTravelStory(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Please sign in to share your travel story.",
    };
  }

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const authorName = String(formData.get("author_name") || "").trim();
  const coverImage = String(formData.get("cover_image") || "").trim();

  if (!title || !content || !authorName) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const { error } = await supabase.from("travel_stories").insert({
    submitted_by: user.id,
    author_name: authorName,
    author_email: user.email,
    title,
    slug: slugify(title),
    content,
    cover_image: coverImage || null,
    status: "pending",
  });

  if (error) {
    return { success: false, message: "Something went wrong. Try again." };
  }

  revalidatePath("/stories");
  return {
    success: true,
    message: "Thanks for sharing! Your story is pending approval.",
  };
}

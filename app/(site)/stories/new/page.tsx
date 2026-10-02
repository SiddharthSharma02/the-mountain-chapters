import { createClient } from "@/lib/supabase/server";
import { NewStoryPageContent } from "@/components/site/story-form";

export default async function NewStoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultAuthorName: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    defaultAuthorName = profile?.full_name ?? undefined;
  }

  return (
    <NewStoryPageContent
      defaultAuthorName={defaultAuthorName}
      signedIn={!!user}
    />
  );
}

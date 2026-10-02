import { StayBuilder } from "@/components/admin/stays/stay-builder";
import { createClient } from "@/lib/supabase/server";

export default async function NewStayPage() {
  const supabase = await createClient();
  const { data: destinations } = await supabase.from("destinations").select("id, name").order("name");
  return <StayBuilder stay={null} destinations={destinations ?? []} />;
}

import { notFound } from "next/navigation";
import { StayBuilder } from "@/components/admin/stays/stay-builder";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeStay } from "@/lib/stays/normalize";
import { STAY_FULL_SELECT, type BuilderTab, type RawStayRow } from "@/lib/stays/types";
import { isUuid } from "@/lib/stays/validation";

function isBuilderTab(value: unknown): value is BuilderTab {
  return typeof value === "string" && ["basics", "media", "story", "amenities", "rooms", "reviews", "location", "policies", "seo"].includes(value);
}

export default async function StayBuilderPage({ params, searchParams }: PageProps<"/admin/stays/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();
  const supabase = createAdminClient();
  const [{ data, error }, { data: destinations, error: destinationsError }] = await Promise.all([
    supabase.from("stays").select(STAY_FULL_SELECT).eq("id", id).maybeSingle(),
    supabase.from("destinations").select("id, name").order("name"),
  ]);
  if (error) throw new Error(`Unable to load stay: ${error.message}`);
  if (destinationsError) throw new Error(`Unable to load destinations: ${destinationsError.message}`);
  if (!data) notFound();

  const initialTab = isBuilderTab(tab) ? tab : "basics";
  return (
    <StayBuilder
      stay={normalizeStay(data as RawStayRow, { includeInactive: true })}
      destinations={destinations ?? []}
      initialTab={initialTab}
    />
  );
}

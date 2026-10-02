import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { StayProfile } from "@/components/stays/stay-profile";
import { createClient } from "@/lib/supabase/server";
import { normalizeStay } from "@/lib/stays/normalize";
import { isUuid } from "@/lib/stays/validation";
import { STAY_FULL_SELECT, type RawStayRow } from "@/lib/stays/types";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/**
 * Secure preview: lives under /admin (gated by the proxy) and re-checks is_admin() here.
 * Uses the admin's session, so RLS returns unpublished stays; inactive rooms, reviews
 * and sections are filtered exactly as on the public page.
 */
export default async function StayPreviewPage({ params }: PageProps<"/admin/preview/stays/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/admin/login");

  const { data } = await supabase.from("stays").select(STAY_FULL_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <StayProfile stay={normalizeStay(data as RawStayRow)} preview />
      </main>
      <Footer />
    </>
  );
}

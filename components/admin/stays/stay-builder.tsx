"use client";

import Link from "next/link";
import { useState } from "react";
import { useSave } from "@/components/admin/stays/builder-ui";
import { AmenitiesTab, BasicsTab, MediaTab, SeoTab, type Destination } from "@/components/admin/stays/tabs-basic";
import { LocationTab, PoliciesTab } from "@/components/admin/stays/tabs-location-policies";
import { ReviewsTab, RoomsTab } from "@/components/admin/stays/tabs-rooms-reviews";
import { StoryTab } from "@/components/admin/stays/tabs-story";
import { setStayPublished } from "@/lib/actions/admin-stay-builder";
import { BUILDER_TABS, type BuilderTab, type StayProfile } from "@/lib/stays/types";
const TAB_LABELS: Record<BuilderTab, string> = {
  basics: "Basics", media: "Media", story: "Story", amenities: "Amenities", rooms: "Rooms",
  reviews: "Reviews", location: "Location", policies: "Policies", seo: "SEO",
};

/**
 * Stay Builder: one tab per concern, each saving independently. All tabs stay mounted
 * so unsaved edits survive switching tabs. A new stay only has Basics until it's created.
 */
export function StayBuilder({
  stay,
  destinations,
  initialTab = "basics",
}: {
  stay: StayProfile | null;
  destinations: Destination[];
  initialTab?: BuilderTab;
}) {
  const [tab, setTab] = useState<BuilderTab>(stay ? initialTab : "basics");
  const [published, setPublished] = useState(stay?.is_published ?? false);
  const publish = useSave();

  const select = (t: BuilderTab) => {
    setTab(t);
    window.history.replaceState(null, "", `?tab=${t}`);
  };

  const panels: Record<BuilderTab, React.ReactNode> = stay
    ? {
        basics: <BasicsTab stay={stay} destinations={destinations} />,
        media: <MediaTab stay={stay} />,
        story: <StoryTab stay={stay} />,
        amenities: <AmenitiesTab stay={stay} />,
        // Remount when the server list changes (e.g. after duplicate) so local order resets.
        rooms: <RoomsTab key={stay.rooms.map((r) => `${r.id}:${r.is_active}`).join()} stay={stay} />,
        reviews: <ReviewsTab stay={stay} />,
        location: <LocationTab stay={stay} />,
        policies: <PoliciesTab stay={stay} />,
        seo: <SeoTab stay={stay} />,
      }
    : ({ basics: <BasicsTab stay={null} destinations={destinations} /> } as Record<BuilderTab, React.ReactNode>);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/stays" className="text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold">← All stays</Link>
          <h1 className="mt-2 truncate font-serif text-3xl font-bold text-navy">{stay?.name ?? "Create stay"}</h1>
          {stay && (
            <p className="mt-1 flex items-center gap-2 text-sm text-navy/60">
              <span className={`inline-block h-2 w-2 rounded-full ${published ? "bg-emerald-500" : "bg-navy/30"}`} aria-hidden />
              {published ? "Published" : "Draft — not visible to guests"}
            </p>
          )}
        </div>
        {stay && (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/admin/preview/stays/${stay.id}`}
              target="_blank"
              rel="noopener"
              className="min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
            >
              Preview
            </a>
            {published && (
              <a href={`/stays/${stay.slug}`} target="_blank" rel="noopener" className="min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy">
                View live
              </a>
            )}
            <button
              type="button"
              disabled={publish.state.status === "saving"}
              onClick={async () => {
                const next = !published;
                if (!next && !confirm("Unpublish this stay? Guests will no longer be able to see it.")) return;
                const res = await publish.run(() => setStayPublished(stay.id, next));
                if (res) setPublished(next);
              }}
              className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60 ${
                published ? "bg-white text-navy ring-1 ring-navy/20 hover:ring-navy" : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {published ? "Unpublish" : "Publish"}
            </button>
          </div>
        )}
      </div>
      {publish.state.status === "error" && <p role="alert" className="text-sm text-red-600">{publish.state.error}</p>}

      <nav
        aria-label="Stay builder sections"
        className="no-scrollbar sticky top-0 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-navy/10 bg-cream-dark/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border"
      >
        {BUILDER_TABS.map((t) => {
          const disabled = !stay && t !== "basics";
          return (
            <button
              key={t}
              type="button"
              disabled={disabled}
              title={disabled ? "Create the stay first" : undefined}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => select(t)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                tab === t ? "bg-navy text-cream" : "text-navy/70 hover:bg-white hover:text-navy"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          );
        })}
      </nav>

      {BUILDER_TABS.map((t) =>
        panels[t] ? (
          <div key={t} hidden={tab !== t}>
            {panels[t]}
          </div>
        ) : null
      )}
    </div>
  );
}

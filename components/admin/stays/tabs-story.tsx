"use client";

import { useState } from "react";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { inputClass, Panel, SaveBar, SingleImageField, TextField, Toggle, newId, useSave } from "@/components/admin/stays/builder-ui";
import { saveStaySections } from "@/lib/actions/admin-stay-builder";
import { formatINR } from "@/lib/stays/pricing";
import { SECTION_TYPES, type Section, type SectionType, type StayProfile } from "@/lib/stays/types";
import { SECTION_LABELS } from "@/lib/stays/validation";

type Draft = Omit<Section, "stay_id" | "sort_order">;

const HELP: Record<SectionType, string> = {
  image: "A full-width photograph with an optional caption — the core of the scroll.",
  story: "A short piece of writing: what makes this place special.",
  experience: "Something guests can do here, with a photo.",
  quote: "A single line, set large.",
  review: "Feature one of this stay's guest reviews.",
  room: "Feature one room inside the story.",
  gallery: "A swipeable strip of the stay's gallery.",
  amenities: "Place the amenities list here instead of after the rooms.",
  location: "Place the location & map here instead of after the rooms.",
};

const blank = (type: SectionType): Draft => ({
  id: newId(), type, title: null, subtitle: null, body: null, image_url: null, review_id: null, room_id: null, is_active: true,
});

export function StoryTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [sections, setSections] = useState<Draft[]>(() =>
    stay.sections.map(({ stay_id: _s, sort_order: _o, ...s }) => s)
  );
  const update = (id: string, patch: Partial<Draft>) =>
    setSections((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const reviews = stay.reviews;
  const rooms = stay.rooms;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Story"
        description="Build the scroll like a profile: alternate views, story and guest voices. Drag sections to change the order guests see. Without any sections, the page alternates gallery photos with highlighted reviews automatically."
      >
        <div className="rounded-2xl bg-navy px-4 py-3 text-sm text-cream/80">
          <span className="font-semibold text-cream">Always first:</span> hero photo → name, rating & location
        </div>

        {sections.length > 0 && (
          <SortableList
            items={sections}
            onReorder={setSections}
            getKey={(s) => s.id}
            label={(s, i) => `section ${i + 1} (${SECTION_LABELS[s.type]})`}
          >
            {(s, i) => (
              <div className={`flex flex-col gap-4 ${s.is_active ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif text-lg text-navy">
                    <span className="mr-2 text-sm tabular-nums text-gold-dark">{String(i + 1).padStart(2, "0")}</span>
                    {SECTION_LABELS[s.type]}
                  </p>
                  <div className="flex items-center gap-4">
                    <Toggle label="Visible" checked={s.is_active} onChange={(is_active) => update(s.id, { is_active })} />
                    <button type="button" onClick={() => setSections((all) => all.filter((x) => x.id !== s.id))} className="text-sm font-medium text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </div>
                </div>
                <SectionFields section={s} stay={stay} onChange={(patch) => update(s.id, patch)} reviews={reviews} rooms={rooms} />
              </div>
            )}
          </SortableList>
        )}

        <div>
          <p className="text-sm font-medium text-navy">Add a section</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SECTION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                title={HELP[t]}
                onClick={() => setSections((all) => [...all, blank(t)])}
                className="min-h-10 rounded-full bg-white px-4 text-sm font-medium text-navy ring-1 ring-navy/15 hover:ring-navy/40"
              >
                + {SECTION_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-cream-dark/50 px-4 py-3 text-sm text-navy/70">
          <span className="font-semibold text-navy">Then, automatically:</span> rooms → amenities → location → reviews → property rules → FAQ → booking
        </div>
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStaySections(stay.id, { sections }))} label="Save story" />
    </div>
  );
}

function SectionFields({
  section: s, stay, onChange, reviews, rooms,
}: {
  section: Draft;
  stay: StayProfile;
  onChange: (patch: Partial<Draft>) => void;
  reviews: StayProfile["reviews"];
  rooms: StayProfile["rooms"];
}) {
  const hint = <p className="text-xs text-navy/50">{HELP[s.type]}</p>;
  const image = (label = "Image") => (
    <SingleImageField label={label} value={s.image_url} onChange={(image_url) => onChange({ image_url })} folder={`${stay.id}/story`} />
  );
  const text = (field: "title" | "subtitle" | "body", label: string, multiline = false, placeholder?: string) => (
    <TextField label={label} value={s[field]} onChange={(v) => onChange({ [field]: v || null })} multiline={multiline} rows={3} placeholder={placeholder} />
  );

  switch (s.type) {
    case "image":
      return <>{hint}{image()}{text("title", "Caption headline", false, "Wake up above the clouds")}{text("body", "Caption text (optional)", true)}</>;
    case "story":
    case "experience":
      return <>{hint}{text("subtitle", "Eyebrow (optional)", false, s.type === "story" ? "The story" : "Experience")}{text("title", "Title")}{text("body", "Text", true)}{image("Image (optional)")}</>;
    case "quote":
      return <>{hint}{text("title", "Quote", false, "Evenings around the fire.")}{text("subtitle", "Attribution (optional)")}</>;
    case "review":
      return (
        <>
          {hint}
          {reviews.length === 0 ? (
            <p className="text-sm text-navy/60">Add and save reviews in the Reviews tab first.</p>
          ) : (
            <select aria-label="Review to feature" value={s.review_id ?? ""} onChange={(e) => onChange({ review_id: e.target.value || null })} className={inputClass}>
              <option value="">Choose a review…</option>
              {reviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reviewer_name} · {r.rating}★ — {r.review_text.slice(0, 50)}{r.review_text.length > 50 ? "…" : ""}{r.is_active ? "" : " (hidden)"}
                </option>
              ))}
            </select>
          )}
        </>
      );
    case "room":
      return (
        <>
          {hint}
          {rooms.length === 0 ? (
            <p className="text-sm text-navy/60">Add rooms in the Rooms tab first.</p>
          ) : (
            <select aria-label="Room to feature" value={s.room_id ?? ""} onChange={(e) => onChange({ room_id: e.target.value || null })} className={inputClass}>
              <option value="">Choose a room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}{r.price_per_night ? ` · ${formatINR(r.price_per_night)}` : ""}{r.is_active ? "" : " (hidden)"}
                </option>
              ))}
            </select>
          )}
        </>
      );
    default:
      return <>{hint}{text("title", "Heading (optional)")}</>;
  }
}

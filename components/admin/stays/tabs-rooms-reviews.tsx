"use client";

import Link from "next/link";
import { useState } from "react";
import { SortableList } from "@/components/admin/stays/sortable-list";
import { inputClass, Panel, SaveBar, SingleImageField, TextField, Toggle, newId, useSave } from "@/components/admin/stays/builder-ui";
import { deleteRoom, duplicateRoom, reorderRooms, saveStayReviews, setRoomActive } from "@/lib/actions/admin-stay-builder";
import { TRAVELLER_TYPES } from "@/lib/stays/amenity-catalog";
import { roomFacts } from "@/lib/stays/format";
import { formatINR } from "@/lib/stays/pricing";
import { REVIEW_CATEGORIES } from "@/lib/stays/reviews";
import type { Review, Room, StayProfile } from "@/lib/stays/types";

// ---------- Rooms ----------

export function RoomsTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [rooms, setRooms] = useState<Room[]>(stay.rooms);

  const reorder = (next: Room[]) => {
    setRooms(next);
    void run(() => reorderRooms(stay.id, next.map((r) => r.id)));
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Rooms" description="Each room gets its own photos, amenities and price. Order here is the order guests see. Hidden rooms never appear publicly.">
        {rooms.length === 0 ? (
          <p className="rounded-2xl bg-cream-dark/40 px-4 py-6 text-center text-sm text-navy/60">
            No rooms yet — the public page shows “Room details coming soon” with the stay&apos;s starting price.
          </p>
        ) : (
          <SortableList items={rooms} onReorder={reorder} getKey={(r) => r.id} label={(r) => r.name}>
            {(r) => (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {r.room_images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img src={r.room_images[0].image_url} alt="" className="h-20 w-full rounded-xl object-cover sm:w-28" />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-xl bg-cream-dark/60 text-xs text-navy/40 sm:w-28">No photos</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-navy">
                    {r.name}
                    {!r.is_active && <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 align-middle font-sans text-xs text-navy/60">Hidden</span>}
                  </p>
                  <p className="text-sm font-medium text-navy">{r.price_per_night ? `${formatINR(r.price_per_night)} / night` : "No price set"}</p>
                  <p className="text-xs text-navy/55">
                    {[...roomFacts(r), `${r.room_images.length} ${r.room_images.length === 1 ? "image" : "images"}`].join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                  <Link href={`/admin/stays/${stay.id}/rooms/${r.id}`} className="text-gold-dark hover:text-gold">Edit</Link>
                  <button type="button" className="text-navy/70 hover:text-navy" onClick={() => run(() => duplicateRoom(stay.id, r.id))}>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="text-navy/70 hover:text-navy"
                    onClick={async () => {
                      const res = await run(() => setRoomActive(stay.id, r.id, !r.is_active));
                      if (res) setRooms((all) => all.map((x) => (x.id === r.id ? { ...x, is_active: !r.is_active } : x)));
                    }}
                  >
                    {r.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700"
                    onClick={async () => {
                      if (!confirm(`Delete “${r.name}” and its photos, amenities and rate plans?`)) return;
                      const res = await run(() => deleteRoom(stay.id, r.id));
                      if (res) setRooms((all) => all.filter((x) => x.id !== r.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </SortableList>
        )}
        <Link
          href={`/admin/stays/${stay.id}/rooms/new`}
          className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-dashed border-navy/20 text-sm font-semibold text-navy hover:border-navy/50"
        >
          + Add room
        </Link>
      </Panel>
      <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-600" : "text-navy/50"}`}>
        {state.status === "saving" && "Saving…"}
        {state.status === "saved" && "Saved ✓"}
        {state.status === "error" && state.error}
      </p>
    </div>
  );
}

// ---------- Reviews ----------

type ReviewDraft = Omit<Review, "stay_id" | "sort_order" | "created_at">;

const blankReview = (): ReviewDraft => ({
  id: newId(), room_id: null, reviewer_name: "", rating: 5, review_text: "", traveller_type: null, stayed_on: null,
  reviewer_image: null, guest_photo: null, cleanliness_rating: null, location_rating: null, hospitality_rating: null,
  facilities_rating: null, value_rating: null, is_highlight: false, is_active: true,
});

export function ReviewsTab({ stay }: { stay: StayProfile }) {
  const { state, run } = useSave();
  const [reviews, setReviews] = useState<ReviewDraft[]>(() =>
    stay.reviews.map(({ stay_id: _s, sort_order: _o, created_at: _c, ...r }) => r)
  );
  const [open, setOpen] = useState<string | null>(null);
  const [legacy, setLegacy] = useState({ rating: String(stay.rating || ""), review_count: String(stay.review_count || "") });
  const update = (id: string, patch: Partial<ReviewDraft>) =>
    setReviews((all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Guest reviews" description="Only add genuine reviews from real guests — they are shown publicly and in search results. Highlighted reviews are woven between the photos.">
        {reviews.length > 0 && (
          <SortableList items={reviews} onReorder={setReviews} getKey={(r) => r.id} label={(r, i) => `review ${i + 1}${r.reviewer_name ? ` by ${r.reviewer_name}` : ""}`}>
            {(r) => (
              <div className="flex flex-col gap-4">
                <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full items-start justify-between gap-3 text-left" aria-expanded={open === r.id}>
                  <span className="min-w-0">
                    <span className="font-semibold text-navy">{r.reviewer_name || "New review"}</span>
                    <span className="ml-2 text-sm text-gold-dark">{r.rating}★</span>
                    {r.is_highlight && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold-dark">Highlight</span>}
                    {!r.is_active && <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-xs text-navy/60">Hidden</span>}
                    <span className="mt-0.5 block truncate text-sm text-navy/60">{r.review_text || "—"}</span>
                  </span>
                  <span aria-hidden className="text-navy/40">{open === r.id ? "−" : "+"}</span>
                </button>
                {open === r.id && (
                  <div className="flex flex-col gap-4 border-t border-navy/10 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField label="Reviewer name" value={r.reviewer_name} onChange={(v) => update(r.id, { reviewer_name: v })} />
                      <TextField label="Rating (1–5)" type="number" min={1} max={5} step={0.5} value={r.rating} onChange={(v) => update(r.id, { rating: Number(v) })} />
                    </div>
                    <TextField label="Review text" value={r.review_text} onChange={(v) => update(r.id, { review_text: v })} multiline />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor={`tt-${r.id}`} className="text-sm font-medium text-navy">Traveller type</label>
                        <select id={`tt-${r.id}`} value={r.traveller_type ?? ""} onChange={(e) => update(r.id, { traveller_type: e.target.value || null })} className={`${inputClass} mt-1`}>
                          <option value="">—</option>
                          {TRAVELLER_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <TextField label="Date of stay" type="date" value={r.stayed_on} onChange={(v) => update(r.id, { stayed_on: v || null })} />
                      <div>
                        <label htmlFor={`room-${r.id}`} className="text-sm font-medium text-navy">Room (optional)</label>
                        <select id={`room-${r.id}`} value={r.room_id ?? ""} onChange={(e) => update(r.id, { room_id: e.target.value || null })} className={`${inputClass} mt-1`}>
                          <option value="">Whole stay</option>
                          {stay.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <fieldset>
                      <legend className="text-sm font-medium text-navy">Category ratings (optional)</legend>
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {REVIEW_CATEGORIES.map((c) => (
                          <TextField
                            key={c.key}
                            label={c.label}
                            type="number"
                            min={1}
                            max={5}
                            step={0.5}
                            value={r[c.key]}
                            onChange={(v) => update(r.id, { [c.key]: v === "" ? null : Number(v) })}
                          />
                        ))}
                      </div>
                    </fieldset>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SingleImageField label="Reviewer photo" value={r.reviewer_image} onChange={(v) => update(r.id, { reviewer_image: v })} folder={`${stay.id}/reviews`} />
                      <SingleImageField label="Guest photo" value={r.guest_photo} onChange={(v) => update(r.id, { guest_photo: v })} folder={`${stay.id}/reviews`} />
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <Toggle label="Highlight between photos" checked={r.is_highlight} onChange={(v) => update(r.id, { is_highlight: v })} />
                      <Toggle label="Visible" checked={r.is_active} onChange={(v) => update(r.id, { is_active: v })} />
                      <button type="button" onClick={() => setReviews((all) => all.filter((x) => x.id !== r.id))} className="ml-auto text-sm font-medium text-red-600 hover:text-red-700">
                        Delete review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SortableList>
        )}
        <button
          type="button"
          onClick={() => {
            const r = blankReview();
            setReviews((all) => [...all, r]);
            setOpen(r.id);
          }}
          className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-dashed border-navy/20 text-sm font-semibold text-navy hover:border-navy/50"
        >
          + Add review
        </button>
      </Panel>

      <Panel
        title="Rating summary"
        description={
          reviews.some((r) => r.is_active)
            ? "Calculated automatically from the visible reviews above."
            : "An existing rating (e.g. from another platform), used until you add reviews above."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Average rating" type="number" min={0} max={5} step={0.1} value={legacy.rating} disabled={reviews.some((r) => r.is_active)} onChange={(rating) => setLegacy({ ...legacy, rating })} />
          <TextField label="Number of reviews" type="number" min={0} value={legacy.review_count} disabled={reviews.some((r) => r.is_active)} onChange={(review_count) => setLegacy({ ...legacy, review_count })} />
        </div>
      </Panel>
      <SaveBar state={state} onSave={() => run(() => saveStayReviews(stay.id, { reviews, ...legacy }))} label="Save reviews" />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BottomSheet } from "@/components/stays/bottom-sheet";
import { CheckIcon, GridIcon } from "@/components/stays/icons";
import { formatTime } from "@/lib/stays/format";
import type { Amenity, PoliciesRow } from "@/lib/stays/types";

// The full-screen photo viewer is only downloaded when someone opens it.
const Lightbox = dynamic(() => import("@/components/site/lightbox").then((m) => m.Lightbox), { ssr: false });

export function PhotoGalleryButton({
  images,
  stayName,
  variant = "chip",
}: {
  images: string[];
  stayName: string;
  variant?: "chip" | "link";
}) {
  const [index, setIndex] = useState<number | null>(null);
  if (images.length < 2) return null;
  return (
    <>
      {variant === "chip" ? (
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="flex min-h-11 items-center gap-2 rounded-full bg-navy/60 px-4 text-xs font-semibold tabular-nums text-cream backdrop-blur-md hover:bg-navy/75"
          aria-label={`Show all ${images.length} photos`}
        >
          <GridIcon />1 / {images.length}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="flex min-h-11 items-center gap-2 rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy hover:border-navy"
        >
          <GridIcon /> View all {images.length} photos
        </button>
      )}
      {index !== null && (
        <Lightbox
          images={images.map((src, i) => ({ src, alt: `${stayName} photo ${i + 1}` }))}
          index={index}
          onClose={() => setIndex(null)}
          onIndexChange={setIndex}
        />
      )}
    </>
  );
}

export function AmenitiesSheetButton({ amenities }: { amenities: Amenity[] }) {
  const [open, setOpen] = useState(false);
  const groups = new Map<string, Amenity[]>();
  for (const a of amenities) groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy hover:border-navy"
      >
        View all {amenities.length} amenities
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Amenities">
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([category, items]) => (
            <section key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/50">{category}</h3>
              <ul className="mt-3 grid grid-cols-1 gap-2.5 text-[15px] text-navy/85 sm:grid-cols-2">
                {items.map((a) => (
                  <li key={a.id} className="flex items-center gap-2.5">
                    <CheckIcon className="h-4 w-4 text-gold-dark" />
                    {a.name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

export function PoliciesSheetButton({
  policies,
  checkIn,
  checkOut,
}: {
  policies: PoliciesRow | null;
  checkIn: string | null;
  checkOut: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rows: [string, string | null | undefined][] = [
    ["Check-in", formatTime(checkIn)],
    ["Check-out", formatTime(checkOut)],
    ["Pets", policies?.pets],
    ["Smoking", policies?.smoking],
    ["Children", policies?.children],
  ];
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy hover:border-navy"
      >
        View full policies
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Property policies">
        <div className="flex flex-col gap-6 text-[15px] text-navy/85">
          <dl className="divide-y divide-navy/10">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-navy/60">{k}</dt>
                <dd className="text-right font-medium text-navy">{v}</dd>
              </div>
            ))}
          </dl>
          {policies?.cancellation_policy && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/50">Cancellation</h3>
              <p className="mt-2 whitespace-pre-line">{policies.cancellation_policy}</p>
            </section>
          )}
          {policies?.extra_rules && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/50">House rules</h3>
              <p className="mt-2 whitespace-pre-line">{policies.extra_rules}</p>
            </section>
          )}
        </div>
      </BottomSheet>
    </>
  );
}

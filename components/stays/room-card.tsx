"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomSheet } from "@/components/stays/bottom-sheet";
import { ImageCarousel } from "@/components/stays/image-carousel";
import { CheckIcon } from "@/components/stays/icons";
import { enquiryHref } from "@/lib/stays/cta";
import { roomFacts } from "@/lib/stays/format";
import { formatINR } from "@/lib/stays/pricing";
import type { Room } from "@/lib/stays/types";

const CARD_AMENITIES = 3;

function Price({ room, large = false }: { room: Room; large?: boolean }) {
  if (!room.price_per_night) {
    return <p className="text-sm font-medium text-navy/70">Price on request</p>;
  }
  const original = room.original_price && <s className="text-sm text-navy/40">{formatINR(room.original_price)}</s>;
  if (large) {
    // Sheet footer: stacked so it fits beside the button at 360px.
    return (
      <div className="min-w-0">
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="font-serif text-2xl font-semibold text-navy">{formatINR(room.price_per_night)}</span>
          <span className="text-sm text-navy/60">/ night</span>
        </p>
        {original}
      </div>
    );
  }
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-serif text-xl font-semibold text-navy">{formatINR(room.price_per_night)}</span>
      <span className="text-sm text-navy/60">/ night</span>
      {original}
    </p>
  );
}

export function RoomCard({ room, staySlug }: { room: Room; staySlug: string }) {
  const [open, setOpen] = useState(false);
  const facts = roomFacts(room);
  const photos = room.room_images.map((img, i) => ({
    url: img.image_url,
    alt: `${room.name} — ${img.image_type === "room" ? "room" : img.image_type} photo ${i + 1}`,
  }));
  const cancellation = room.room_rate_plans.find((p) => p.cancellation_policy)?.cancellation_policy;
  const select = enquiryHref(staySlug, room.slug);

  return (
    <article className="flex flex-col gap-4" data-reveal="text">
      <ImageCarousel images={photos} label={`${room.name} photos`} aspect="aspect-[4/3]" />

      <div className="flex flex-col gap-2 px-1">
        <h3 className="font-serif text-xl font-semibold uppercase tracking-[0.06em] text-navy">{room.name}</h3>
        {facts.length > 0 && <p className="text-sm text-navy/70">{facts.join(" · ")}</p>}
        {room.view && <p className="text-sm font-medium text-gold-dark">{room.view}</p>}
        {room.room_amenities.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1.5 text-sm text-navy/80">
            {room.room_amenities.slice(0, CARD_AMENITIES).map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-gold-dark" />
                {a.name}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-between gap-4">
          <Price room={room} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-11 shrink-0 rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream"
          >
            View room
          </button>
        </div>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={room.name}
        footer={
          <div className="flex items-center justify-between gap-4">
            <Price room={room} large />
            <Link
              href={select}
              className="flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-light"
            >
              Select this room
            </Link>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <ImageCarousel images={photos} label={`${room.name} gallery`} aspect="aspect-[4/3]" priority />

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {room.room_size && <Fact label="Size" value={room.room_size} />}
            {room.bed_type && <Fact label="Bed" value={room.bed_type} />}
            {room.max_guests && <Fact label="Guests" value={`Sleeps ${room.max_guests}`} />}
            {room.view && <Fact label="View" value={room.view} />}
          </dl>

          {room.description && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-navy/80">{room.description}</p>
          )}

          {room.room_amenities.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/50">Amenities</h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-navy/85 sm:grid-cols-2">
                {room.room_amenities.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-gold-dark" />
                    {a.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cancellation && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/50">Cancellation</h3>
              <p className="mt-2 text-sm text-navy/80">{cancellation}</p>
            </section>
          )}
        </div>
      </BottomSheet>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream-dark/60 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-navy/50">{label}</dt>
      <dd className="mt-0.5 font-medium text-navy">{value}</dd>
    </div>
  );
}

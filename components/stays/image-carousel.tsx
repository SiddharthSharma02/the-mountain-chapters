"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronIcon } from "@/components/stays/icons";
import { FALLBACK_IMAGE, IMAGE_PLACEHOLDER } from "@/lib/stays/image";

export interface CarouselImage {
  url: string;
  alt: string;
}

/**
 * Swipeable photo strip built on native CSS scroll-snap: touch scrolling stays native,
 * nothing auto-advances, and off-screen photos are lazy-loaded by the browser.
 */
export function ImageCarousel({
  images,
  label,
  sizes = "(min-width: 768px) 560px, 92vw",
  aspect = "aspect-[4/3]",
  priority = false,
  rounded = "rounded-3xl",
}: {
  images: CarouselImage[];
  label: string;
  sizes?: string;
  aspect?: string;
  priority?: boolean;
  rounded?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = useCallback(
    (next: number) => {
      const i = Math.max(0, Math.min(count - 1, next));
      setIndex(i);
      const el = track.current;
      el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    },
    [count]
  );

  const onScroll = () => {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(Math.max(0, Math.min(count - 1, i)));
  };

  if (count === 0) {
    return (
      <div className={`relative ${aspect} overflow-hidden bg-cream-dark ${rounded}`}>
        <Image src={FALLBACK_IMAGE} alt={`${label}: photos coming soon`} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden bg-cream-dark ${rounded}`}>
      <div
        ref={track}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-gold ${aspect}`}
      >
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="relative h-full w-full shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes={sizes}
              quality={75}
              loading={priority && i === 0 ? "eager" : "lazy"}
              placeholder={IMAGE_PLACEHOLDER}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-navy/60 px-2.5 py-1 text-[11px] font-medium tabular-nums text-cream backdrop-blur-sm">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-navy shadow-sm transition-opacity disabled:opacity-0 md:flex"
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-navy shadow-sm transition-opacity disabled:opacity-0 md:flex"
          >
            <ChevronIcon />
          </button>
        </>
      )}
    </div>
  );
}

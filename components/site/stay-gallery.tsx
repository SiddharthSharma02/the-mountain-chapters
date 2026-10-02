"use client";

import Image from "next/image";
import { Lightbox, type LightboxImage } from "@/components/site/lightbox";
import { useState } from "react";

export function StayGallery({
  images,
  stayName,
}: {
  images: string[];
  stayName: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const valid = images.filter(Boolean);

  if (valid.length === 0) return null;

  const lightboxImages: LightboxImage[] = valid.map((src, i) => ({
    src,
    alt: `${stayName} photo ${i + 1}`,
  }));

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {valid.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={img}
              alt={`${stayName} photo ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <Lightbox
          images={lightboxImages}
          index={index}
          onClose={() => setIndex(null)}
          onIndexChange={setIndex}
        />
      )}
    </>
  );
}

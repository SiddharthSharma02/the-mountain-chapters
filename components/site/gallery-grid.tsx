"use client";

import Image from "next/image";
import type { GalleryImage } from "@/lib/types/database";
import { Lightbox, type LightboxImage } from "@/components/site/lightbox";
import { useState } from "react";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const lightboxImages: LightboxImage[] = images.map((img) => ({
    src: img.image_url,
    alt: img.caption || "Gallery photo",
  }));

  return (
    <>
      <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative block w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={img.image_url}
              alt={img.caption || "Gallery photo"}
              width={600}
              height={800}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 flex items-end bg-gradient-to-t from-navy/60 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-cream">
                {img.caption}
              </span>
            </span>
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

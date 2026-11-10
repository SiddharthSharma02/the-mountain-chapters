import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import type { Destination } from "@/lib/types/database";

/** Tall photo card with the name set over the image. */
export function DestinationCard({
  destination,
  sizes = "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 78vw",
  featured = false,
}: {
  destination: Destination;
  sizes?: string;
  /** Fills its grid cell instead of keeping a 4:5 shape (used for the wide bento card). */
  featured?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={`group relative block overflow-hidden rounded-[24px] bg-cream-dark ${featured ? "aspect-[4/5] h-full sm:aspect-auto sm:min-h-[420px]" : "aspect-[4/5]"}`}
    >
      <Image
        src={destination.cover_image}
        alt=""
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-cream">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/70">
            {destination.state || "Himachal Pradesh"}
          </p>
          <h3 className={`mt-1.5 font-serif leading-tight ${featured ? "text-[26px] sm:text-4xl" : "text-[26px]"}`}>{destination.name}</h3>
          {destination.tagline && <p className="mt-1 line-clamp-2 text-sm text-cream/80">{destination.tagline}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/15 backdrop-blur transition-colors group-hover:bg-gold group-hover:text-navy">
          <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { Pin } from "@/components/site/icons";
import { formatINR } from "@/lib/stays/pricing";
import type { Stay } from "@/lib/types/database";

export function StayCard({
  stay,
  sizes = "(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
}: {
  stay: Stay;
  sizes?: string;
  priority?: boolean;
}) {
  const place = stay.destinations?.name || stay.destinations?.state || "Himachal Pradesh";
  const price = stay.price_per_night && stay.price_per_night > 0 ? stay.price_per_night : null;
  // Only show a rating that comes with real reviews.
  const rating = stay.review_count > 0 && stay.rating > 0 ? stay.rating : null;

  return (
    <Link href={`/stays/${stay.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-cream-dark">
        <Image
          src={stay.cover_image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {rating && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-xs font-semibold text-navy backdrop-blur">
            ★ {rating.toFixed(1)} <span className="font-normal text-navy/60">({stay.review_count})</span>
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <h3 className="font-serif text-xl leading-snug text-navy group-hover:text-gold-dark">{stay.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-navy/60">
            <Pin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{place}</span>
          </p>
        </div>
        {price && (
          <p className="shrink-0 text-right text-sm text-navy/60">
            from <span className="block font-semibold text-navy">{formatINR(price)}</span>
            <span className="text-xs">/ night</span>
          </p>
        )}
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Stay } from "@/lib/types/database";

export function StayCard({ stay }: { stay: Stay }) {
  return (
    <Link
      href={`/stays/${stay.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={stay.cover_image || "/placeholder-mountain.svg"}
          alt={stay.name}
          fill
          sizes="(min-width: 1024px) 25vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="font-serif text-base font-semibold text-navy">
          {stay.name}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-navy/60">
          <span className="truncate">
            {stay.destinations?.name || stay.destinations?.state || "Himachal Pradesh"}
          </span>
          {stay.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 font-medium text-gold-dark">
              ★ {stay.rating.toFixed(1)}{" "}
              <span className="text-navy/40">({stay.review_count})</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

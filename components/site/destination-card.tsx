import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/types/database";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden">
        <Image
          src={destination.cover_image || "/placeholder-mountain.svg"}
          alt={destination.name}
          fill
          sizes="(min-width: 1024px) 20vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="font-serif text-base font-semibold text-navy">
          {destination.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-navy/60">
          <span aria-hidden>📍</span>
          {destination.state || "Himachal Pradesh"}
        </p>
      </div>
    </Link>
  );
}

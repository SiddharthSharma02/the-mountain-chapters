import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StayCard } from "@/components/site/stay-card";
import {
  getDestinationBySlug,
  getStaysByDestination,
} from "@/lib/data/content";

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) notFound();

  const stays = await getStaysByDestination(destination.id);

  return (
    <div>
      <div className="relative h-64 w-full sm:h-80">
        <Image
          src={destination.cover_image || "/placeholder-mountain.svg"}
          alt={destination.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Link
              href="/destinations"
              className="text-xs font-semibold uppercase tracking-wide text-cream/80 hover:text-gold"
            >
              ← All Destinations
            </Link>
            <h1 className="mt-2 font-serif text-3xl font-bold text-cream sm:text-4xl">
              {destination.name}
            </h1>
            <p className="text-cream/80">{destination.state}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {destination.description && (
          <p className="max-w-3xl text-navy/70">{destination.description}</p>
        )}

        <h2 className="mt-10 font-serif text-2xl font-bold text-navy">
          Stays in {destination.name}
        </h2>
        {stays.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stays.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
            No stays listed for this destination yet.
          </div>
        )}
      </div>
    </div>
  );
}

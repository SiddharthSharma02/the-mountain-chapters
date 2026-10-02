import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoadTripChapterBySlug } from "@/lib/data/content";

export default async function RoadTripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getRoadTripChapterBySlug(slug);

  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/road-trips"
        className="text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
      >
        ← All Road Trips
      </Link>

      <div className="mt-4 relative aspect-16/8 w-full overflow-hidden rounded-3xl">
        <Image
          src={chapter.cover_image || "/placeholder-mountain.svg"}
          alt={chapter.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      <h1 className="mt-6 font-serif text-3xl font-bold text-navy">
        Chapter {String(chapter.step_number).padStart(2, "0")}:{" "}
        {chapter.title}
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        {chapter.distance_km ? `${chapter.distance_km} km` : ""}
        {chapter.distance_km && chapter.duration_days ? " · " : ""}
        {chapter.duration_days ? `${chapter.duration_days} days` : ""}
      </p>

      {chapter.description && (
        <p className="mt-6 text-navy/70">{chapter.description}</p>
      )}

      {chapter.route.length > 0 && (
        <>
          <h2 className="mt-8 font-serif text-xl font-bold text-navy">
            Route
          </h2>
          <ol className="mt-4 space-y-0">
            {chapter.route.map((point, i) => (
              <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {i < chapter.route.length - 1 && (
                  <span
                    className="absolute left-[15px] top-8 h-full w-0.5 bg-navy/15"
                    aria-hidden
                  />
                )}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-cream text-xs font-bold text-navy">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="font-medium text-navy">{point.name}</p>
                  {i === 0 && (
                    <p className="text-xs text-navy/50">Starting point</p>
                  )}
                  {i === chapter.route.length - 1 && i > 0 && (
                    <p className="text-xs text-navy/50">Final destination</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

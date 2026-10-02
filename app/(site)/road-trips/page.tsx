import Image from "next/image";
import Link from "next/link";
import { getRoadTripChapters } from "@/lib/data/content";

export const metadata = { title: "Road Trips | The Mountain Chapters" };

export default async function RoadTripsPage() {
  const chapters = await getRoadTripChapters();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Road Trip Chapters
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Scenic routes, hidden villages and mountain passes — planned for you,
        chapter by chapter.
      </p>

      {chapters.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.id}
              href={`/road-trips/${c.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={c.cover_image || "/placeholder-mountain.svg"}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-bold text-gold">
                  {String(c.step_number).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <p className="font-serif text-lg font-semibold text-navy">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-navy/60">
                  {c.distance_km ? `${c.distance_km} km` : ""}
                  {c.distance_km && c.duration_days ? " · " : ""}
                  {c.duration_days ? `${c.duration_days} days` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No road trip chapters yet. Add some from the admin dashboard.
        </div>
      )}
    </div>
  );
}

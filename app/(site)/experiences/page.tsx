import Image from "next/image";
import { getExperiences } from "@/lib/data/content";

export const metadata = { title: "Experiences | The Mountain Chapters" };

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Experiences
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Trekking, off-road adventures, village walks and everything in
        between — curated and authentic.
      </p>

      {experiences.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((e) => (
            <div
              key={e.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5"
            >
              {e.cover_image && (
                <div className="relative aspect-4/3 w-full">
                  <Image
                    src={e.cover_image}
                    alt={e.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="font-serif text-lg font-semibold text-navy">
                  <span className="mr-2">{e.icon}</span>
                  {e.title}
                </p>
                {e.description && (
                  <p className="mt-2 text-sm text-navy/70">
                    {e.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No experiences yet. Add some from the admin dashboard.
        </div>
      )}
    </div>
  );
}

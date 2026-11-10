import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { EmptyState, PageHeader } from "@/components/site/page-header";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { getRoadTripChapters } from "@/lib/data/content";

export const metadata = { title: "Road Trips" };

export default async function RoadTripsPage() {
  const chapters = await getRoadTripChapters();

  return (
    <>
      <PageHeader
        eyebrow="Road trips"
        title="The road, in chapters"
        intro="Mountain passes, river valleys and villages, broken into days you can actually drive."
      />
      {chapters.length > 0 ? (
        <ol className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-24 sm:px-6 lg:px-8">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <Link
                href={`/road-trips/${c.slug}`}
                className="group grid overflow-hidden rounded-[28px] bg-white ring-1 ring-navy/10 transition-shadow hover:shadow-[0_24px_60px_-30px_rgba(22,38,60,0.35)] md:grid-cols-2"
              >
                <div className={`relative aspect-[4/3] overflow-hidden bg-cream-dark md:aspect-auto md:min-h-80 ${i % 2 ? "md:order-2" : ""}`}>
                  <Image
                    src={c.cover_image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority={i === 0}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-12">
                  <p className="font-serif text-5xl text-gold">{String(c.step_number).padStart(2, "0")}</p>
                  <h2 className="mt-4 font-serif text-3xl leading-tight text-navy sm:text-4xl">{c.title}</h2>
                  {(c.distance_km || c.duration_days) && (
                    <p className="mt-3 text-sm text-navy/60">
                      {[c.distance_km && `${c.distance_km} km`, c.duration_days && `${c.duration_days} ${c.duration_days === 1 ? "day" : "days"}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {c.description && <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-navy/70">{c.description}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4">
                    Read this chapter <ArrowRight />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState message="Our road trip chapters are being written. Ask us about a route you have in mind." />
      )}
    </>
  );
}

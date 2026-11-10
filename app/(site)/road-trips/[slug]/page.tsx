import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DetailHero } from "@/components/site/detail-hero";
import { ArrowRight } from "@/components/site/icons";
import { getRoadTripChapterBySlug } from "@/lib/data/content";

const getChapter = cache(getRoadTripChapterBySlug);

export async function generateMetadata({ params }: PageProps<"/road-trips/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getChapter(slug);
  if (!c) return { title: "Road trip not found" };
  const description = c.description?.slice(0, 155) || `Road trip chapter ${c.step_number}: ${c.title}.`;
  return {
    title: c.title,
    description,
    alternates: { canonical: `/road-trips/${c.slug}` },
    openGraph: { title: c.title, description, images: c.cover_image ? [{ url: c.cover_image }] : undefined },
  };
}

export default async function RoadTripDetailPage({ params }: PageProps<"/road-trips/[slug]">) {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  if (!chapter) notFound();

  const facts = [
    chapter.distance_km && `${chapter.distance_km} km`,
    chapter.duration_days && `${chapter.duration_days} ${chapter.duration_days === 1 ? "day" : "days"}`,
    chapter.route.length > 1 && `${chapter.route.length} stops`,
  ].filter(Boolean);

  return (
    <>
      <DetailHero
        image={chapter.cover_image}
        backHref="/road-trips"
        backLabel="All road trips"
        eyebrow={`Chapter ${String(chapter.step_number).padStart(2, "0")}`}
        title={chapter.title}
        meta={facts.length > 0 ? facts.join("  ·  ") : null}
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:gap-24 lg:px-8">
        <div>
          {chapter.description ? (
            <p className="whitespace-pre-line text-lg leading-[1.8] text-navy/80">{chapter.description}</p>
          ) : (
            <p className="text-lg text-navy/60">Details for this chapter are on their way.</p>
          )}
          <div className="mt-12 rounded-[24px] bg-navy p-8 text-cream">
            <p className="font-serif text-2xl">Want to drive this chapter?</p>
            <p className="mt-2 text-sm text-cream/70">We&apos;ll plan the stops and stays around your dates.</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-navy hover:bg-cream"
            >
              Plan this trip <ArrowRight />
            </Link>
          </div>
        </div>

        {chapter.route.length > 0 && (
          <aside>
            <p className="eyebrow">The route</p>
            <ol className="mt-6">
              {chapter.route.map((point, i) => {
                const last = i === chapter.route.length - 1;
                return (
                  <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
                    {!last && <span aria-hidden className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-navy/20" />}
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-serif text-base text-navy ring-1 ring-gold">
                      {i + 1}
                    </span>
                    <div className="pt-2">
                      <p className="font-serif text-xl leading-tight text-navy">{point.name}</p>
                      {i === 0 && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-navy/50">Start</p>}
                      {last && i > 0 && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-navy/50">Finish</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>
        )}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DetailHero } from "@/components/site/detail-hero";
import { ArrowRight } from "@/components/site/icons";
import { StayCard } from "@/components/site/stay-card";
import { getDestinationBySlug, getStaysByDestination } from "@/lib/data/content";

const getDestination = cache(getDestinationBySlug);

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) return { title: "Destination not found" };
  const description = d.tagline || d.description?.slice(0, 155) || `Stays and road trips in ${d.name}.`;
  return {
    title: `${d.name}${d.state ? `, ${d.state}` : ""}`,
    description,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { title: d.name, description, images: d.cover_image ? [{ url: d.cover_image }] : undefined },
  };
}

export default async function DestinationDetailPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();

  const stays = await getStaysByDestination(destination.id);

  return (
    <>
      <DetailHero
        image={destination.cover_image}
        backHref="/destinations"
        backLabel="All destinations"
        eyebrow={destination.state || "Himachal Pradesh"}
        title={destination.name}
        meta={destination.tagline}
      />

      {destination.description && (
        <section className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
          <p className="whitespace-pre-line font-serif text-2xl leading-[1.45] text-navy sm:text-[28px]">
            {destination.description}
          </p>
        </section>
      )}

      <section className={`mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8 ${destination.description ? "" : "pt-20"}`}>
        <p className="eyebrow">Where to stay</p>
        <h2 className="mt-4 font-serif text-[36px] leading-[1.05] text-navy sm:text-5xl">Stays in {destination.name}</h2>
        {stays.length > 0 ? (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stays.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[24px] bg-cream-dark/60 px-6 py-12 text-center">
            <p className="font-serif text-xl text-navy">We haven&apos;t listed a stay here yet.</p>
            <p className="mt-2 text-sm text-navy/65">We know the area well. Tell us your dates and we&apos;ll find you somewhere good.</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light"
            >
              Ask us <ArrowRight />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

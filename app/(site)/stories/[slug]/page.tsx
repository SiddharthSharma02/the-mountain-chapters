import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DetailHero } from "@/components/site/detail-hero";
import { ArrowRight } from "@/components/site/icons";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { getStoryBySlug } from "@/lib/data/content";

const getStory = cache(getStoryBySlug);

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getStory(slug);
  if (!s) return { title: "Story not found" };
  const description = s.content.replace(/\s+/g, " ").slice(0, 155);
  return {
    title: s.title,
    description,
    alternates: { canonical: `/stories/${slug}` },
    openGraph: { type: "article", title: s.title, description, images: s.cover_image ? [{ url: s.cover_image }] : undefined },
  };
}

export default async function StoryDetailPage({ params }: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  const date = new Date(story.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <article>
      <DetailHero
        image={story.cover_image}
        backHref="/stories"
        backLabel="All stories"
        eyebrow="Traveller story"
        title={story.title}
        meta={`By ${story.author_name} · ${date}`}
      />

      <div className="mx-auto max-w-[68ch] px-5 py-20 sm:py-24">
        <div className="whitespace-pre-line text-[17px] leading-[1.85] text-navy/85 sm:text-lg first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.9] first-letter:text-gold-dark">
          {story.content}
        </div>
      </div>

      {story.images.length > 0 && (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 pb-20 sm:grid-cols-3 sm:gap-4 sm:px-6">
          {story.images.map((img, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-cream-dark">
              <Image
                src={img}
                alt={`${story.title}, photo ${i + 1}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <p className="font-serif text-2xl text-navy">Have a mountain story of your own?</p>
        <Link
          href="/stories/new"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          Share it with us <ArrowRight />
        </Link>
      </div>
    </article>
  );
}

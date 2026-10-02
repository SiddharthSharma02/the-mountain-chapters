import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/data/content";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/stories"
        className="text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
      >
        ← All Stories
      </Link>

      {story.cover_image && (
        <div className="mt-4 relative aspect-16/8 w-full overflow-hidden rounded-3xl">
          <Image
            src={story.cover_image}
            alt={story.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      <h1 className="mt-6 font-serif text-3xl font-bold text-navy">
        {story.title}
      </h1>
      <p className="mt-1 text-sm text-navy/50">by {story.author_name}</p>

      <div className="mt-6 whitespace-pre-line text-navy/80">
        {story.content}
      </div>

      {story.images.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {story.images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={img}
                alt={`${story.title} photo ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

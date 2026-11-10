import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import type { TravelStory } from "@/lib/types/database";

/** Editorial card for a traveller's story. */
export function StoryCard({ story }: { story: TravelStory }) {
  const href = story.slug ? `/stories/${story.slug}` : "/stories";
  const excerpt = story.content.replace(/\s+/g, " ").trim().slice(0, 160);
  return (
    <Link href={href} className="group flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[24px] bg-cream-dark">
        <Image
          src={story.cover_image}
          alt=""
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-4 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
        By {story.author_name}
      </p>
      <h3 className="mt-2 px-1 font-serif text-xl leading-snug text-navy group-hover:text-gold-dark">{story.title}</h3>
      {excerpt && (
        <p className="mt-2 line-clamp-3 px-1 text-sm leading-relaxed text-navy/65">
          {excerpt}
          {story.content.length > 160 ? "…" : ""}
        </p>
      )}
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { TravelStory } from "@/lib/types/database";

export function StoryCard({ story }: { story: TravelStory }) {
  const href = story.slug ? `/stories/${story.slug}` : "/stories";
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={story.cover_image || "/placeholder-mountain.svg"}
          alt={story.title}
          fill
          sizes="100px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div>
        <p className="font-serif text-sm font-semibold leading-snug text-navy">
          {story.title}
        </p>
        <span className="mt-1 inline-block text-xs font-medium uppercase tracking-wide text-gold-dark">
          Read More
        </span>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { TravelStory } from "@/lib/types/database";

export function StoryGridCard({ story }: { story: TravelStory }) {
  return (
    <Link
      href={story.slug ? `/stories/${story.slug}` : "#"}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full">
        <Image
          src={story.cover_image || "/placeholder-mountain.svg"}
          alt={story.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <p className="font-serif text-lg font-semibold text-navy">
          {story.title}
        </p>
        <p className="mt-1 text-xs text-navy/50">by {story.author_name}</p>
        <p className="mt-2 line-clamp-2 text-sm text-navy/70">
          {story.content}
        </p>
      </div>
    </Link>
  );
}

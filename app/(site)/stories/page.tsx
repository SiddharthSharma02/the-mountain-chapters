import Link from "next/link";
import { StoryList } from "@/components/site/story-list";
import { getApprovedStories } from "@/lib/data/content";

export const metadata = { title: "Travel Stories | The Mountain Chapters" };

export default async function StoriesPage() {
  const stories = await getApprovedStories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
            Travel Stories
          </h1>
          <p className="mt-2 max-w-xl text-navy/70">
            Real stories from real travellers who found their chapter in the
            mountains.
          </p>
        </div>
        <Link
          href="/stories/new"
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-dark"
        >
          Share Your Story
        </Link>
      </div>

      {stories.length > 0 ? (
        <StoryList stories={stories} />
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No stories yet. Be the first to share yours!
        </div>
      )}
    </div>
  );
}

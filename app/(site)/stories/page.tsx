import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { EmptyState, PageHeader } from "@/components/site/page-header";
import { StoryList } from "@/components/site/story-list";
import { getApprovedStories } from "@/lib/data/content";

export const metadata = { title: "Travel Stories" };

export default async function StoriesPage() {
  const stories = await getApprovedStories();

  return (
    <>
      <PageHeader
        eyebrow="From our travellers"
        title="Stories from the road"
        intro="Written by people who found their chapter in the mountains."
      >
        <Link
          href="/stories/new"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          Share your story <ArrowRight />
        </Link>
      </PageHeader>
      {stories.length > 0 ? (
        <StoryList stories={stories} />
      ) : (
        <EmptyState message="No stories yet. Been to the mountains with us? Yours could be the first." />
      )}
    </>
  );
}

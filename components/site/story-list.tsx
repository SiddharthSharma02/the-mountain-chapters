"use client";

import { StoryCard } from "@/components/site/story-card";
import { NoMatches, SearchField } from "@/components/site/search-field";
import type { TravelStory } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function StoryList({ stories }: { stories: TravelStory[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter((s) => [s.title, s.author_name, s.content].some((v) => v.toLowerCase().includes(q)));
  }, [query, stories]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {stories.length > 6 && (
        <div className="mb-10">
          <SearchField value={query} onChange={setQuery} label="Search stories" />
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      ) : (
        <NoMatches query={query} onClear={() => setQuery("")} />
      )}
    </div>
  );
}

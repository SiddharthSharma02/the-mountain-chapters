"use client";

import { StoryGridCard } from "@/components/site/story-grid-card";
import type { TravelStory } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function StoryList({ stories }: { stories: TravelStory[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.author_name.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }, [query, stories]);

  return (
    <div>
      <div className="relative mt-8 max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories…"
          className="w-full rounded-full border border-navy/20 bg-white py-2.5 pl-10 pr-4 text-sm text-navy placeholder:text-navy/40 focus:border-gold focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StoryGridCard key={s.id} story={s} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No stories match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}

"use client";

import { StayCard } from "@/components/site/stay-card";
import { NoMatches, SearchField } from "@/components/site/search-field";
import type { Stay } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function StayList({ stays }: { stays: Stay[] }) {
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");

  const destinationOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stays) {
      if (s.destination_id && s.destinations?.name) map.set(s.destination_id, s.destinations.name);
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [stays]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stays.filter((s) => {
      const matchesQuery =
        !q || [s.name, s.address, s.destinations?.name].some((v) => (v ?? "").toLowerCase().includes(q));
      const matchesDest = destination === "all" || s.destination_id === destination;
      return matchesQuery && matchesDest;
    });
  }, [query, destination, stays]);

  const chip = (active: boolean) =>
    `min-h-11 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${
      active ? "bg-navy text-cream" : "bg-white text-navy ring-1 ring-navy/15 hover:ring-navy/40"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4">
        {stays.length > 6 && <SearchField value={query} onChange={setQuery} label="Search stays" />}
        {destinationOptions.length > 1 && (
          <div role="group" aria-label="Filter by destination" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <button type="button" aria-pressed={destination === "all"} onClick={() => setDestination("all")} className={chip(destination === "all")}>
              All
            </button>
            {destinationOptions.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={destination === d.id}
                onClick={() => setDestination(d.id)}
                className={chip(destination === d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <StayCard key={s.id} stay={s} priority={i < 3} />
          ))}
        </div>
      ) : (
        <NoMatches
          query={query || "this filter"}
          onClear={() => {
            setQuery("");
            setDestination("all");
          }}
        />
      )}
    </div>
  );
}

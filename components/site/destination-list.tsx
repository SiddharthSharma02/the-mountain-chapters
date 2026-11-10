"use client";

import { DestinationCard } from "@/components/site/destination-card";
import { NoMatches, SearchField } from "@/components/site/search-field";
import type { Destination } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function DestinationList({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) =>
      [d.name, d.state, d.tagline].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [query, destinations]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {destinations.length > 6 && (
        <div className="mb-8">
          <SearchField value={query} onChange={setQuery} label="Search destinations" />
        </div>
      )}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      ) : (
        <NoMatches query={query} onClear={() => setQuery("")} />
      )}
    </div>
  );
}

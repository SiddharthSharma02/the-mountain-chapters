"use client";

import { DestinationCard } from "@/components/site/destination-card";
import type { Destination } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function DestinationList({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.state ?? "").toLowerCase().includes(q) ||
        (d.tagline ?? "").toLowerCase().includes(q)
    );
  }, [query, destinations]);

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
          placeholder="Search destinations…"
          className="w-full rounded-full border border-navy/20 bg-white py-2.5 pl-10 pr-4 text-sm text-navy placeholder:text-navy/40 focus:border-gold focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No destinations match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}

"use client";

import { StayCard } from "@/components/site/stay-card";
import type { Stay } from "@/lib/types/database";
import { useMemo, useState } from "react";

export function StayList({ stays }: { stays: Stay[] }) {
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");

  const destinationOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stays) {
      const id = s.destination_id ?? "none";
      const name = s.destinations?.name ?? "Unassigned";
      map.set(id, name);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [stays]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stays.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q) ||
        (s.destinations?.name ?? "").toLowerCase().includes(q);
      const matchesDest =
        destination === "all" || (s.destination_id ?? "none") === destination;
      return matchesQuery && matchesDest;
    });
  }, [query, destination, stays]);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/40">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stays…"
            className="w-full rounded-full border border-navy/20 bg-white py-2.5 pl-10 pr-4 text-sm text-navy placeholder:text-navy/40 focus:border-gold focus:outline-none"
          />
        </div>
        {destinationOptions.length > 1 && (
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded-full border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="all">All destinations</option>
            {destinationOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StayCard key={s.id} stay={s} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No stays match your search.
        </div>
      )}
    </div>
  );
}

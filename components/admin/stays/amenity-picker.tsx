"use client";

import { useId, useState } from "react";
import { amenityKey, OTHER_CATEGORY } from "@/lib/stays/amenity-catalog";
import type { AmenityInput } from "@/lib/stays/types";
import { inputClass } from "@/components/admin/form-field";

const chip = (on: boolean) =>
  `min-h-10 rounded-full px-4 text-sm font-medium transition-colors ${
    on ? "bg-navy text-cream" : "bg-white text-navy ring-1 ring-navy/15 hover:ring-navy/40"
  }`;

/** Selectable amenity chips grouped by category, plus free-text custom amenities. */
export function AmenityPicker({
  catalog,
  value,
  onChange,
}: {
  catalog: Record<string, string[]>;
  value: AmenityInput[];
  onChange: (next: AmenityInput[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const inputId = useId();
  const selected = new Set(value.map((v) => amenityKey(v.name)));
  const catalogKeys = new Set(Object.values(catalog).flat().map(amenityKey));
  const customItems = value.filter((v) => !catalogKeys.has(amenityKey(v.name)));

  const toggle = (name: string, category: string) => {
    const key = amenityKey(name);
    onChange(
      selected.has(key)
        ? value.filter((v) => amenityKey(v.name) !== key)
        : [...value, { id: crypto.randomUUID(), name, category, icon: null }]
    );
  };

  const addCustom = () => {
    const name = custom.trim();
    if (!name || selected.has(amenityKey(name))) {
      setCustom("");
      return;
    }
    onChange([...value, { id: crypto.randomUUID(), name, category: OTHER_CATEGORY, icon: null }]);
    setCustom("");
  };

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(catalog).map(([category, items]) => (
        <div key={category} role="group" aria-label={category}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">{category}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((name) => {
              const on = selected.has(amenityKey(name));
              return (
                <button key={name} type="button" aria-pressed={on} onClick={() => toggle(name, category)} className={chip(on)}>
                  {on && <span aria-hidden>✓ </span>}
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div role="group" aria-label={OTHER_CATEGORY}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">{OTHER_CATEGORY}</p>
        {customItems.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {customItems.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed
                title="Click to remove"
                onClick={() => onChange(value.filter((v) => v.id !== a.id))}
                className={chip(true)}
              >
                <span aria-hidden>✓ </span>
                {a.name}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor={inputId}>
            Custom amenity
          </label>
          <input
            id={inputId}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="e.g. Private chef, Stargazing deck"
            className={inputClass}
          />
          <button type="button" onClick={addCustom} className="shrink-0 rounded-lg bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy-light">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

export function SearchField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="relative block w-full sm:max-w-sm">
      <span className="sr-only">{label}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/45"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="min-h-12 w-full rounded-full bg-white pl-11 pr-4 text-sm text-navy ring-1 ring-navy/15 placeholder:text-navy/45 focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  );
}

export function NoMatches({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-[24px] bg-cream-dark/60 px-6 py-12 text-center">
      <p className="font-serif text-xl text-navy">Nothing matches &ldquo;{query}&rdquo;</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 min-h-11 text-sm font-semibold text-navy underline decoration-gold underline-offset-4"
      >
        Clear search
      </button>
    </div>
  );
}

type P = { className?: string };
const base = "shrink-0";

export const StarIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={`${base} ${className}`}>
    <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
  </svg>
);
export const CheckIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={`${base} ${className}`}>
    <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PinIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={`${base} ${className}`}>
    <path d="M10 18s6-5.4 6-10a6 6 0 10-12 0c0 4.6 6 10 6 10z" />
    <circle cx="10" cy="8" r="2.2" />
  </svg>
);
export const ChevronIcon = ({ className = "h-4 w-4", dir = "right" }: P & { dir?: "left" | "right" | "down" }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
    className={`${base} ${className} ${dir === "left" ? "rotate-180" : dir === "down" ? "rotate-90" : ""}`}>
    <path d="M7.5 4.5L13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const CloseIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={`${base} ${className}`}>
    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
  </svg>
);
export const GridIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={`${base} ${className}`}>
    <rect x="3" y="3" width="5.5" height="5.5" rx="1" /><rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
    <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" /><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1" />
  </svg>
);

/** Stars filled proportionally (4.5 → four and a half), so ratings are never rounded up. */
export function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-flex">
            <StarIcon className={`${className} opacity-25`} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <StarIcon className={className} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

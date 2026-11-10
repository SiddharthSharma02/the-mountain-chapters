/** Thin line icons for the public site (replaces emoji, which render differently on every device). */
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const ArrowRight = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowDown = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const Pin = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const Cabin = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M3 11 12 4l9 7M5 9.5V20h14V9.5M10 20v-5h4v5" /></svg>
);
export const Road = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M8 3 4 21M16 3l4 18M12 4v3M12 10.5v3M12 17v3" /></svg>
);
export const Compass = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>
);
export const Peaks = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="m2 19 7-11 4 6 2.5-3.5L22 19H2Z" /><path d="m7.5 10.5 1.5 1 1.3-1" /></svg>
);
export const Clock = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Phone = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);
export const Mail = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);

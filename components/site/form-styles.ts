/** Shared styles for public forms, so every form looks and behaves the same. */
export const fieldLabel = "text-sm font-medium text-navy";
export const fieldInput =
  "mt-2 block min-h-12 w-full rounded-xl bg-white px-4 py-3 text-[15px] text-navy ring-1 ring-navy/15 placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-gold";
export const primaryButton =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-[15px] font-semibold text-cream transition-colors hover:bg-navy-light disabled:opacity-60";
export const formMessage = (ok: boolean) =>
  `rounded-xl px-4 py-3 text-sm ${ok ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`;

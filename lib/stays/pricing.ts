import type { StayProfile } from "@/lib/stays/types";

export interface StartingPrice {
  amount: number;
  /** "rooms" = cheapest active room; "stay" = the legacy stay-level fallback price. */
  source: "rooms" | "stay";
}

/** Headline "from" price. Never invents one: returns null when nothing is priced. */
export function startingPrice(stay: Pick<StayProfile, "rooms" | "price_per_night">): StartingPrice | null {
  const roomPrices = stay.rooms
    .filter((r) => r.is_active)
    .map((r) => r.price_per_night)
    .filter((p): p is number => typeof p === "number" && p > 0);
  if (roomPrices.length > 0) return { amount: Math.min(...roomPrices), source: "rooms" };
  if (stay.price_per_night && stay.price_per_night > 0) return { amount: stay.price_per_night, source: "stay" };
  return null;
}

export function formatINR(amount: number): string {
  const whole = Number.isInteger(amount);
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

/** Percentage saved, only when the original price is genuinely higher. */
export function discountPercent(price: number | null, original: number | null): number | null {
  if (!price || !original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

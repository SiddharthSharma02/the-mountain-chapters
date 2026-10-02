import type { Review, StayProfile } from "@/lib/stays/types";

export const REVIEW_CATEGORIES = [
  { key: "cleanliness_rating", label: "Cleanliness" },
  { key: "location_rating", label: "Location" },
  { key: "hospitality_rating", label: "Hospitality" },
  { key: "facilities_rating", label: "Facilities" },
  { key: "value_rating", label: "Value" },
] as const;

type CategoryKey = (typeof REVIEW_CATEGORIES)[number]["key"];

export interface ReviewSummary {
  /** "reviews" = computed from reviews on the page; "legacy" = the admin-entered summary on the stay. */
  source: "reviews" | "legacy" | "none";
  average: number | null;
  count: number;
  categories: { key: CategoryKey; label: string; average: number }[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;

export function summarizeReviews(
  stay: Pick<StayProfile, "reviews" | "rating" | "review_count">
): ReviewSummary {
  const reviews: Review[] = stay.reviews.filter((r) => r.is_active);
  if (reviews.length > 0) {
    const categories = REVIEW_CATEGORIES.flatMap(({ key, label }) => {
      const values = reviews.map((r) => r[key]).filter((v): v is number => typeof v === "number");
      return values.length > 0 ? [{ key, label, average: round1(mean(values)) }] : [];
    });
    return { source: "reviews", average: round1(mean(reviews.map((r) => r.rating))), count: reviews.length, categories };
  }
  if (stay.rating > 0) {
    return { source: "legacy", average: round1(stay.rating), count: stay.review_count, categories: [] };
  }
  return { source: "none", average: null, count: 0, categories: [] };
}

/** Hosts Next.js may optimise images from. Shared with next.config.ts. */
export const OPTIMIZED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "wyxzrhpbsptpeyhjlvie.supabase.co",
] as const;

export const FALLBACK_IMAGE = "/placeholder-mountain.svg";

/**
 * Turns any stored image URL into something safe to render.
 * - Local paths and allow-listed https hosts are optimised.
 * - Other https hosts (e.g. a pasted link in a guest story) render unoptimised
 *   instead of crashing the page.
 * - Anything else (empty, http:, javascript:, junk) becomes the placeholder.
 */
export function resolveImage(url: string | null | undefined): { src: string; unoptimized: boolean } {
  const s = (url ?? "").trim();
  if (!s) return { src: FALLBACK_IMAGE, unoptimized: false };
  if (s.startsWith("/") && !s.startsWith("//")) return { src: s, unoptimized: false };
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return { src: FALLBACK_IMAGE, unoptimized: false };
    const allowed = (OPTIMIZED_IMAGE_HOSTS as readonly string[]).includes(u.hostname);
    return { src: s, unoptimized: !allowed };
  } catch {
    return { src: FALLBACK_IMAGE, unoptimized: false };
  }
}

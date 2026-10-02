"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement only: the page is fully readable without this. GSAP is
 * loaded lazily after hydration and skipped entirely for prefers-reduced-motion.
 * Scrolling stays native — no pinning, no scroll-jacking, no horizontal hijack.
 *
 * Hooks (set in markup):
 *   data-reveal="image"  fade 0→1, scale 1.04→1
 *   data-reveal="text"   fade 0→1, y 20→0
 *   data-parallax        subtle vertical drift of the inner image (desktop only)
 */
export function StayMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Anything already on screen at load stays put — no flash of hidden content.
        const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9;

        gsap.utils.toArray<HTMLElement>("[data-reveal='image']").filter(below).forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            scale: 1.04,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal='text']").filter(below).forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const img = el.querySelector("img");
            if (!img) return;
            gsap.fromTo(img, { yPercent: -4 }, {
              yPercent: 4,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            });
          });
        });
      });
      revert = () => ctx.revert();
    })().catch(() => {
      // Animation is optional; failing to load GSAP must never break the page.
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}

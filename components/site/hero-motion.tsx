"use client";

import { useEffect } from "react";

/**
 * Cinematic hero, as progressive enhancement (the hero is complete without it):
 *  - on load, the photo settles from a slight zoom and the headline lines rise in
 *  - while scrolling past, the photo drifts down and zooms gently and the copy lifts away
 * Transforms and opacity only, native scrolling (no pinning), skipped for reduced motion.
 *
 * Hooks: [data-hero] section, [data-hero-media] photo wrapper, [data-hero-copy] text,
 * [data-hero-line] lines that rise in on load.
 */
export function HeroMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (!hero) return;
        const media = hero.querySelector("[data-hero-media]");
        const copy = hero.querySelector("[data-hero-copy]");

        gsap.from(media, { scale: 1.12, duration: 1.8, ease: "expo.out" });
        gsap.from(hero.querySelectorAll("[data-hero-line]"), {
          yPercent: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.15,
        });

        const scroll = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
        gsap.to(media, { yPercent: 18, scale: 1.08, ease: "none", scrollTrigger: scroll });
        gsap.to(copy, { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { ...scroll, end: "70% top" } });
      });
      revert = () => ctx.revert();
    })().catch(() => {
      // Motion is optional; never break the page.
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}

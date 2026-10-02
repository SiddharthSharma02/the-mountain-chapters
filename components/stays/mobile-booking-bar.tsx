"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bookingCta } from "@/lib/stays/cta";
import { formatINR, type StartingPrice } from "@/lib/stays/pricing";

/**
 * Sticky booking bar. Hidden over the hero, slides in once the guest scrolls past it,
 * and shows which part of the profile they're reading. Visibility is driven by
 * IntersectionObserver so it works with or without GSAP / reduced motion.
 */
export function MobileBookingBar({
  stayName,
  price,
  hasRooms,
  enquireHref,
}: {
  stayName: string;
  price: StartingPrice | null;
  hasRooms: boolean;
  enquireHref: string;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [reachedRooms, setReachedRooms] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.getElementById("stay-hero");
    const rooms = document.getElementById("rooms");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      const o = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
      o.observe(hero);
      observers.push(o);
    }
    if (rooms) {
      // Once the rooms section reaches the middle of the screen (or has been scrolled past).
      const o = new IntersectionObserver(
        ([e]) => setReachedRooms(e.isIntersecting || e.boundingClientRect.top < 0),
        { rootMargin: "0px 0px -50% 0px" }
      );
      o.observe(rooms);
      observers.push(o);
    }
    // "You are here": the last labelled section whose top has passed the middle of the screen.
    const labelled = [...document.querySelectorAll<HTMLElement>("[data-section-label]")];
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = window.innerHeight / 2;
        const current = labelled.filter((el) => el.getBoundingClientRect().top < mid).at(-1);
        setActive(current?.dataset.sectionLabel ?? null);
      });
    };
    if (labelled.length > 0) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const cta = bookingCta({ pastHero, reachedRooms, hasRooms });
  const buttonClass =
    "flex min-h-12 shrink-0 items-center rounded-full bg-navy px-5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light";

  return (
    <div
      data-testid="booking-bar"
      data-visible={cta.visible ? "true" : "false"}
      aria-hidden={!cta.visible}
      inert={!cta.visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-cream/95 backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        cta.visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-dark">
            {active ?? stayName}
          </p>
          {price ? (
            <p className="text-navy">
              <span className="text-xs text-navy/60">{price.source === "rooms" ? "From " : ""}</span>
              <span className="font-serif text-lg font-semibold">{formatINR(price.amount)}</span>
              <span className="text-xs text-navy/60"> /night</span>
            </p>
          ) : (
            <p className="text-sm text-navy/70">Price on request</p>
          )}
        </div>
        {cta.action === "rooms" ? (
          <a href="#rooms" className={buttonClass}>
            {cta.label}
          </a>
        ) : (
          <Link href={enquireHref} className={buttonClass}>
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}

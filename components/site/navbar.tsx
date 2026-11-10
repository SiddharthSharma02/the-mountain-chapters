"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/site/icons";

/** Shown in the desktop bar. Kept short on purpose. */
const PRIMARY = [
  { href: "/destinations", label: "Destinations" },
  { href: "/stays", label: "Stays" },
  { href: "/road-trips", label: "Road Trips" },
  { href: "/experiences", label: "Experiences" },
  { href: "/stories", label: "Stories" },
];
/** Extra links in the phone menu. */
const SECONDARY = [
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * `overlay` (home page): the bar floats transparently over the hero and turns solid
 * once you scroll. Everywhere else it is a normal sticky bar.
 */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const clear = overlay && !scrolled && !open;

  return (
    <>
      <header
        className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          clear ? "bg-transparent text-cream" : "bg-cream/90 text-navy shadow-[0_1px_0_rgba(22,38,60,0.08)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="The Mountain Chapters, home">
            <Image
              src="/logo-256.jpg"
              alt=""
              width={44}
              height={44}
              priority
              className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10 sm:h-11 sm:w-11"
            />
            <span className="font-serif text-[17px] font-semibold leading-none tracking-tight sm:text-xl">
              The Mountain Chapters
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {PRIMARY.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`relative py-2 text-[13px] font-medium tracking-wide transition-opacity hover:opacity-100 ${
                  isActive(l.href) ? "opacity-100" : "opacity-75"
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300 ${
                    isActive(l.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className={`hidden min-h-11 items-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-colors sm:inline-flex ${
                clear ? "bg-cream text-navy hover:bg-gold" : "bg-navy text-cream hover:bg-navy-light"
              }`}
            >
              Plan your trip <ArrowRight />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Phone / tablet menu: full screen, big tap targets. Kept outside <header> because
          the header's backdrop blur would otherwise trap this fixed panel inside it. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream text-navy sm:top-[72px] lg:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-5 pb-safe pt-4">
          <ul className="flex flex-col">
            {PRIMARY.map((l, i) => (
              <li key={l.href} className="border-b border-navy/10">
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between font-serif text-[28px] leading-none"
                >
                  <span className={isActive(l.href) ? "text-gold-dark" : undefined}>{l.label}</span>
                  <span className="font-sans text-xs text-navy/40">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {SECONDARY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-11 items-center text-base text-navy/70">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mb-4 mt-auto flex min-h-14 items-center justify-center gap-2 rounded-full bg-navy text-base font-semibold text-cream"
          >
            Plan your trip <ArrowRight />
          </Link>
        </nav>
      </div>
    </>
  );
}

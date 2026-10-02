"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home", caption: "Back to top" },
  { href: "/destinations", label: "Destinations", caption: "Explore places" },
  { href: "/stays", label: "Stays", caption: "Book a homestay" },
  { href: "/experiences", label: "Experiences", caption: "Things to do" },
  { href: "/road-trips", label: "Road Trips", caption: "Scenic routes" },
  { href: "/stories", label: "Stories", caption: "Traveler tales" },
  { href: "/gallery", label: "Gallery", caption: "Photo journal" },
  { href: "/about", label: "About", caption: "Our story" },
  { href: "/contact", label: "Contact", caption: "Get in touch" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape and on outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-navy/10 bg-cream/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-cream/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.jpeg"
            alt="The Mountain Chapters"
            width={56}
            height={56}
            priority
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-navy/10 sm:h-12 sm:w-12"
          />
          <span className="whitespace-nowrap font-serif text-sm font-bold leading-tight tracking-tight text-navy sm:text-lg">
            The Mountain
            <br className="sm:hidden" /> Chapters
          </span>
        </Link>

        <nav className="hidden items-center gap-4 xl:flex xl:gap-5 2xl:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group/nav relative whitespace-nowrap py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:text-navy"
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              <span
                className={
                  isActive(link.href) ? "text-gold-dark" : "text-navy/75"
                }
              >
                {link.label}
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center opacity-0 transition-all duration-300 group-hover/nav:translate-y-1 group-hover/nav:opacity-100">
                <span className="h-1.5 w-1.5 rotate-45 bg-navy" />
                <span className="mt-1 whitespace-nowrap rounded-md bg-navy px-2.5 py-1 text-[10px] font-medium normal-case tracking-normal text-cream shadow-lg">
                  {link.caption}
                </span>
              </span>
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0 group-hover/nav:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:block">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-navy px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-cream shadow-sm transition-all hover:-translate-y-0.5 hover:bg-navy-light hover:shadow-md"
          >
            Plan Your Trip
            <span aria-hidden>→</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/20 transition-colors hover:border-gold xl:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 rounded-full bg-navy transition-all duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-navy transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 rounded-full bg-navy transition-all duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`overflow-hidden border-navy/10 bg-cream transition-[max-height,opacity] duration-300 xl:hidden ${
          open ? "max-h-[calc(100vh-64px)] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
        ref={menuRef}
      >
        <nav className="flex max-h-[calc(100vh-64px)] flex-col gap-1 overflow-y-auto px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                isActive(link.href)
                  ? "bg-gold/10 text-gold-dark"
                  : "text-navy/80 hover:bg-navy/5 hover:text-gold"
              }`}
            >
              <span>{link.label}</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-navy/40 transition-colors group-hover:text-gold">
                {link.caption}
              </span>
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-cream"
          >
            Plan Your Trip
          </Link>
        </nav>
      </div>
    </header>
  );
}

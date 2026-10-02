"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/stays", label: "Stays" },
  { href: "/admin/experiences", label: "Experiences" },
  { href: "/admin/road-trips", label: "Road Trips" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/routes", label: "Map Routes" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

export function AdminDesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive(pathname, item.href)
              ? "bg-cream/10 text-gold"
              : "text-cream/80 hover:bg-cream/10 hover:text-cream"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-3 overflow-x-auto border-b border-navy/10 bg-white px-4 py-2 text-sm lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={`shrink-0 rounded-full px-3 py-1.5 transition-colors ${
            isActive(pathname, item.href)
              ? "bg-navy text-cream"
              : "text-navy/70 hover:text-navy"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

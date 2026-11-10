import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Pin } from "@/components/site/icons";

const EXPLORE = [
  { href: "/destinations", label: "Destinations" },
  { href: "/stays", label: "Stays" },
  { href: "/road-trips", label: "Road Trips" },
  { href: "/experiences", label: "Experiences" },
];
const COMPANY = [
  { href: "/stories", label: "Travel Stories" },
  { href: "/stories/new", label: "Share your story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const PHONE = "+91 94599 99121";
const EMAIL = "themountainchapters@gmail.com";

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/logo-256.jpg" alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <span className="font-serif text-2xl">The Mountain Chapters</span>
            </Link>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream/65">
              Himalayan stays and road trips, curated from Narkanda by people who live in these mountains.
            </p>
          </div>

          <FooterList title="Explore" links={EXPLORE} />
          <FooterList title="The Mountain Chapters" links={COMPANY} />

          <div>
            <p className="eyebrow !text-gold">Talk to us</p>
            <ul className="mt-5 space-y-1 text-[15px] text-cream/75">
              <li>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-3 hover:text-gold">
                  <Phone /> {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="inline-flex min-h-11 items-center gap-3 break-all hover:text-gold">
                  <Mail className="h-4 w-4 shrink-0" /> {EMAIL}
                </a>
              </li>
              <li className="inline-flex min-h-11 items-center gap-3">
                <Pin /> Narkanda, Himachal Pradesh
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-cream/10 pt-6 text-xs text-cream/45 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} The Mountain Chapters</p>
          <p>Made in the Himalayas</p>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow !text-gold">{title}</p>
      <ul className="mt-5 space-y-1 text-[15px] text-cream/75">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

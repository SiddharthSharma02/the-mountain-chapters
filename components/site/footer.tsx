import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/stays", label: "Stays" },
  { href: "/experiences", label: "Experiences" },
  { href: "/road-trips", label: "Road Trips" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const TOP_DESTINATIONS = [
  "Narkanda",
  "Sangla Valley",
  "Spiti Valley",
  "Kalpa",
  "Chitkul",
  "Tabo",
  "Kaza",
];

const HELP_LINKS = [
  { href: "/about", label: "Travel Guide" },
  { href: "/contact", label: "FAQs" },
  { href: "/contact", label: "Booking & Cancellation" },
  { href: "/contact", label: "Privacy Policy" },
  { href: "/contact", label: "Terms & Conditions" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-cream/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="The Mountain Chapters"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <p className="font-serif text-xl font-bold text-cream">
              The Mountain Chapters
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            We curate authentic Himalayan experiences — handpicked stays and
            road trips that pair well with a good story.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            Quick Links
          </p>
          <ul className="space-y-2 text-sm text-cream/70">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            Top Destinations
          </p>
          <ul className="space-y-2 text-sm text-cream/70">
            {TOP_DESTINATIONS.map((name) => (
              <li key={name}>
                <Link href="/destinations" className="hover:text-gold">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            Help
          </p>
          <ul className="space-y-2 text-sm text-cream/70">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-gold">
            Contact Us
          </p>
          <p className="mt-2 text-sm text-cream/70">+91 94599 99121</p>
          <p className="text-sm text-cream/70">
            themountainchapters@gmail.com
          </p>
          <p className="text-sm text-cream/70">
            Narkanda, Himachal Pradesh, India
          </p>
        </div>
      </div>

      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
        &copy; {new Date().getFullYear()} The Mountain Chapters. All rights
        reserved.
      </div>
    </footer>
  );
}

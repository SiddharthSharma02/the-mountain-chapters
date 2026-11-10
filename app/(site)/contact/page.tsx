import { ContactForm } from "@/components/site/contact-form";
import { Mail, Phone, Pin } from "@/components/site/icons";
import { getPublishedStay } from "@/lib/data/content";

export const metadata = { title: "Contact" };

/** "Check availability" on a stay links here with ?stay=<slug>&room=<slug>. */
async function availabilityMessage(stay: unknown, room: unknown): Promise<string> {
  if (typeof stay !== "string" || !stay) return "";
  const profile = await getPublishedStay(stay);
  if (!profile) return "";
  const roomName = typeof room === "string" ? profile.rooms.find((r) => r.slug === room)?.name : undefined;
  return `Hi! I'd like to check availability at ${profile.name}${roomName ? ` (${roomName})` : ""}.\n\nDates: \nGuests: `;
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { stay, room } = await searchParams;
  const defaultMessage = await availabilityMessage(stay, room);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <p className="eyebrow">Plan your trip</p>
          <h1 className="mt-4 font-serif text-[40px] leading-[1.05] text-navy sm:text-6xl">
            Tell us where you&apos;d like to wake up
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-navy/70 sm:text-lg">
            Share your dates, how many of you are travelling and the pace you like. We reply within 24 hours
            with ideas and availability.
          </p>

          <ul className="mt-10 space-y-1 text-[15px] text-navy">
            <li>
              <a href="tel:+919459999121" className="inline-flex min-h-12 items-center gap-3 hover:text-gold-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-navy/10"><Phone /></span>
                +91 94599 99121
              </a>
            </li>
            <li>
              <a href="mailto:themountainchapters@gmail.com" className="inline-flex min-h-12 items-center gap-3 break-all hover:text-gold-dark">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-navy/10"><Mail /></span>
                themountainchapters@gmail.com
              </a>
            </li>
            <li className="inline-flex min-h-12 items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-navy/10"><Pin /></span>
              Narkanda, Himachal Pradesh
            </li>
          </ul>
        </div>

        <div className="rounded-[28px] bg-cream-dark/60 p-6 sm:p-10">
          <ContactForm defaultMessage={defaultMessage} />
        </div>
      </div>
    </div>
  );
}

import { ContactForm } from "@/components/site/contact-form";
import { getPublishedStay } from "@/lib/data/content";

export const metadata = { title: "Contact | The Mountain Chapters" };

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
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Plan Your Trip
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Have a question or ready to book? Send us a message and we&apos;ll
        get back to you within 24 hours.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ContactForm defaultMessage={defaultMessage} />

        <div className="rounded-2xl bg-navy p-8 text-cream">
          <p className="font-serif text-xl font-bold">Contact Details</p>
          <p className="mt-4 text-sm text-cream/80">+91 94599 99121</p>
          <p className="text-sm text-cream/80">
            themountainchapters@gmail.com
          </p>
          <p className="text-sm text-cream/80">
            Narkanda, Himachal Pradesh, India
          </p>
        </div>
      </div>
    </div>
  );
}

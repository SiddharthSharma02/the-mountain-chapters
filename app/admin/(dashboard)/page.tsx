import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CARDS = [
  { table: "destinations", label: "Destinations", href: "/admin/destinations" },
  { table: "stays", label: "Stays", href: "/admin/stays" },
  { table: "experiences", label: "Experiences", href: "/admin/experiences" },
  { table: "road_trip_chapters", label: "Road Trips", href: "/admin/road-trips" },
  { table: "travel_stories", label: "Stories", href: "/admin/stories" },
  { table: "gallery_images", label: "Gallery Images", href: "/admin/gallery" },
  { table: "contact_messages", label: "Messages", href: "/admin/messages" },
  { table: "newsletter_subscribers", label: "Subscribers", href: "/admin/subscribers" },
] as const;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const counts = await Promise.all(
    CARDS.map(async (c) => {
      const { count } = await supabase
        .from(c.table)
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    })
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-navy/60">
        Overview of your content across The Mountain Chapters.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <Link
            key={c.table}
            href={c.href}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md"
          >
            <p className="font-serif text-3xl font-bold text-navy">
              {counts[i]}
            </p>
            <p className="mt-1 text-sm text-navy/60">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

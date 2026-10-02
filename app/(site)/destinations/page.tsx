import { DestinationList } from "@/components/site/destination-list";
import { getAllDestinations } from "@/lib/data/content";

export const metadata = { title: "Destinations | The Mountain Chapters" };

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Destinations
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Explore the Himalayan valleys and villages we know and love — each
        with its own stays, stories and secrets.
      </p>

      {destinations.length > 0 ? (
        <DestinationList destinations={destinations} />
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No destinations yet. Add some from the admin dashboard.
        </div>
      )}
    </div>
  );
}

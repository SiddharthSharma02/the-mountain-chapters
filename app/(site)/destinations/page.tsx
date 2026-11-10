import { EmptyState, PageHeader } from "@/components/site/page-header";
import { DestinationList } from "@/components/site/destination-list";
import { getAllDestinations } from "@/lib/data/content";

export const metadata = { title: "Destinations" };

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();

  return (
    <>
      <PageHeader
        eyebrow="Where to go"
        title="Valleys and villages we know by heart"
        intro="From the apple country of Narkanda to the high desert of Spiti, each place has its own stays, roads and stories."
      />
      {destinations.length > 0 ? (
        <DestinationList destinations={destinations} />
      ) : (
        <EmptyState message="Destinations are on their way. Ask us about any valley in Himachal." />
      )}
    </>
  );
}

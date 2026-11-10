import { EmptyState, PageHeader } from "@/components/site/page-header";
import { StayList } from "@/components/site/stay-list";
import { getAllStays } from "@/lib/data/content";

export const metadata = { title: "Stays" };

export default async function StaysPage() {
  const stays = await getAllStays();

  return (
    <>
      <PageHeader
        eyebrow="Where to stay"
        title="Stays with a view worth waking up for"
        intro="Homestays, cottages and small lodges across Himachal, each one visited and chosen by us."
      />
      {stays.length > 0 ? (
        <StayList stays={stays} />
      ) : (
        <EmptyState message="We're adding our first stays. Tell us where you're headed and we'll suggest one." />
      )}
    </>
  );
}

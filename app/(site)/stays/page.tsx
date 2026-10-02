import { StayList } from "@/components/site/stay-list";
import { getAllStays } from "@/lib/data/content";

export const metadata = { title: "Stays | The Mountain Chapters" };

export default async function StaysPage() {
  const stays = await getAllStays();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Stays
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        Handpicked homestays, cottages and boutique properties in the lap of
        the mountains.
      </p>

      {stays.length > 0 ? (
        <StayList stays={stays} />
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No stays yet. Add some from the admin dashboard.
        </div>
      )}
    </div>
  );
}

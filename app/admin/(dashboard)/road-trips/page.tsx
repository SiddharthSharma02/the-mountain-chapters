import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteRoadTripChapter } from "@/lib/actions/admin-road-trips";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminRoadTripsPage() {
  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from("road_trip_chapters")
    .select("*")
    .order("step_number", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">Road Trips</h1>
        <Link
          href="/admin/road-trips/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          + New Chapter
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Distance</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {chapters?.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-navy/70">
                  {String(c.step_number).padStart(2, "0")}
                </td>
                <td className="px-4 py-3 font-medium text-navy">{c.title}</td>
                <td className="px-4 py-3 text-navy/70">
                  {c.distance_km ? `${c.distance_km} km` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/road-trips/${c.id}/edit`}
                      className="text-sm font-medium text-gold-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteRoadTripChapter.bind(null, c.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!chapters || chapters.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy/50">
                  No road trip chapters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

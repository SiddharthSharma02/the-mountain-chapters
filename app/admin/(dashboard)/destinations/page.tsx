import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteDestination } from "@/lib/actions/admin-destinations";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminDestinationsPage() {
  const supabase = await createClient();
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">
          Destinations
        </h1>
        <Link
          href="/admin/destinations/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          + New Destination
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Popular</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {destinations?.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-navy">{d.name}</td>
                <td className="px-4 py-3 text-navy/70">{d.state}</td>
                <td className="px-4 py-3">{d.is_popular ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{d.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/destinations/${d.id}/edit`}
                      className="text-sm font-medium text-gold-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteDestination.bind(null, d.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!destinations || destinations.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy/50">
                  No destinations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

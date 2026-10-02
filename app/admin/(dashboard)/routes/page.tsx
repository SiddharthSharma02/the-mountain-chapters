import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteMapRoute } from "@/lib/actions/admin-routes";
import { DeleteButton } from "@/components/admin/delete-button";
import type { RoutePoint } from "@/lib/types/database";

export default async function AdminRoutesPage() {
  const supabase = await createClient();
  const { data: routes } = await supabase
    .from("map_routes")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">Map Routes</h1>
        <Link
          href="/admin/routes/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          + New Route
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Stops</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {routes?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-navy">{r.name}</td>
                <td className="px-4 py-3 text-navy/70">
                  {(r.points as RoutePoint[] | null)
                    ?.map((p) => p.name)
                    .join(" → ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/routes/${r.id}/edit`}
                      className="text-sm font-medium text-gold-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteMapRoute.bind(null, r.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {(!routes || routes.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy/50">
                  No routes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

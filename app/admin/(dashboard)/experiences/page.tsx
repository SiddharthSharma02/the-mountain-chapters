import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "@/lib/actions/admin-experiences";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminExperiencesPage() {
  const supabase = await createClient();
  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">Experiences</h1>
        <Link
          href="/admin/experiences/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          + New Experience
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {experiences?.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-navy">
                  <span className="mr-2">{e.icon}</span>
                  {e.title}
                </td>
                <td className="px-4 py-3 text-navy/70">{e.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/experiences/${e.id}/edit`}
                      className="text-sm font-medium text-gold-dark hover:text-gold"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteExperience.bind(null, e.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {(!experiences || experiences.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy/50">
                  No experiences yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

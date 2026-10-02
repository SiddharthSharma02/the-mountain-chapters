import { createClient } from "@/lib/supabase/server";
import { setStoryStatus, deleteStory } from "@/lib/actions/admin-stories";
import { DeleteButton } from "@/components/admin/delete-button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminStoriesPage() {
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from("travel_stories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">
        Travel Stories
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        Moderate stories submitted by customers.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {stories?.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-navy">{s.title}</td>
                <td className="px-4 py-3 text-navy/70">{s.author_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {s.status !== "approved" && (
                      <form action={setStoryStatus.bind(null, s.id, "approved")}>
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          Approve
                        </button>
                      </form>
                    )}
                    {s.status !== "rejected" && (
                      <form action={setStoryStatus.bind(null, s.id, "rejected")}>
                        <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
                          Reject
                        </button>
                      </form>
                    )}
                    <DeleteButton action={deleteStory.bind(null, s.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {(!stories || stories.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-navy/50">
                  No stories submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

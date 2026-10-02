import { createClient } from "@/lib/supabase/server";
import { deleteSubscriber } from "@/lib/actions/admin-messages";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminSubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Subscribers</h1>
      <p className="mt-1 text-sm text-navy/60">
        Newsletter subscribers ({subscribers?.length ?? 0}).
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {subscribers?.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-navy">{s.email}</td>
                <td className="px-4 py-3 text-navy/70">
                  {new Date(s.subscribed_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton action={deleteSubscriber.bind(null, s.id)} />
                </td>
              </tr>
            ))}
            {(!subscribers || subscribers.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-navy/50">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  updateUserProfile,
  deleteUserProfile,
} from "@/lib/actions/admin-users";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const users = profiles ?? [];
  const admin = createAdminClient();

  const emails = await Promise.all(
    users.map(async (u) => {
      const { data, error } = await admin.auth.admin.getUserById(u.id);
      return error ? null : (data.user?.email ?? null);
    })
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Users</h1>
      <p className="mt-1 text-sm text-navy/60">
        Manage registered users and admins. Phone numbers are collected at
        signup and are compulsory for every account.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-cream-dark/50 text-navy/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {users.map((user, i) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-navy">
                  {user.full_name || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-navy/70">
                  {emails[i] ?? "—"}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {user.phone ? (
                    user.phone
                  ) : (
                    <span className="text-red-500">Missing</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <form action={updateUserProfile} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      type="hidden"
                      name="full_name"
                      value={user.full_name ?? ""}
                    />
                    <input
                      type="hidden"
                      name="phone"
                      value={user.phone ?? ""}
                    />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded-md border border-navy/20 bg-white px-2 py-1 text-xs"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium text-gold-dark hover:text-gold"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton action={deleteUserProfile.bind(null, user.id)} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy/50">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


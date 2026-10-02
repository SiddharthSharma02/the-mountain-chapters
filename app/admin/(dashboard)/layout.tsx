import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { AdminDesktopNav, AdminMobileNav } from "@/components/admin/nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let user;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), 3_000)
      ),
    ]);
    user = result.data.user;
  } catch {
    user = null;
  }

  if (!user) redirect("/admin/login");

  let profile;
  try {
    const result = await Promise.race([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("db timeout")), 3_000)
      ),
    ]);
    profile = result.data;
  } catch {
    profile = null;
  }

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-cream-dark/30">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy px-4 py-6 text-cream lg:flex">
        <Link href="/admin" className="px-2 font-serif text-lg font-bold">
          The Mountain Chapters
        </Link>
        <p className="px-2 text-xs text-cream/50">Admin Dashboard</p>
        <AdminDesktopNav />
        <form action={signOut} className="mt-auto px-2 pt-6">
          <button
            type="submit"
            className="text-sm font-medium text-cream/60 hover:text-gold"
          >
            Sign Out
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3 lg:hidden">
          <Link href="/admin" className="font-serif font-bold text-navy">
            Admin
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm text-navy/60">
              Sign Out
            </button>
          </form>
        </header>
        <AdminMobileNav />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

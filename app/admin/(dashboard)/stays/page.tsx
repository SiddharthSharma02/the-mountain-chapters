import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteStay } from "@/lib/actions/admin-stays";
import { DeleteButton } from "@/components/admin/delete-button";

type Row = {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  price_per_night: number | null;
  is_published: boolean;
  is_featured: boolean;
  rooms: { count: number }[];
};

export default async function AdminStaysPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stays")
    .select("id, name, slug, cover_image, price_per_night, is_published, is_featured, rooms(count)")
    .order("created_at", { ascending: false });
  const stays = (data ?? []) as Row[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">Stays</h1>
        <Link href="/admin/stays/new" className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light">
          + New Stay
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {stays.map((s) => (
          <li key={s.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5 sm:flex-row sm:items-center">
            {s.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
              <img src={s.cover_image} alt="" className="h-20 w-full rounded-xl object-cover sm:w-28" />
            ) : (
              <div className="h-20 w-full rounded-xl bg-cream-dark/60 sm:w-28" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg font-semibold text-navy">{s.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-navy/60">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${s.is_published ? "bg-emerald-50 text-emerald-700" : "bg-navy/10 text-navy/60"}`}>
                  {s.is_published ? "Published" : "Draft"}
                </span>
                {s.is_featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 font-semibold text-gold-dark">Featured</span>}
                <span>{s.rooms?.[0]?.count ?? 0} rooms</span>
                {s.price_per_night ? <span>· from ₹{Number(s.price_per_night).toLocaleString("en-IN")}</span> : null}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href={`/admin/stays/${s.id}`} className="text-gold-dark hover:text-gold">Open builder</Link>
              <a href={`/admin/preview/stays/${s.id}`} target="_blank" rel="noopener" className="text-navy/70 hover:text-navy">Preview</a>
              <DeleteButton action={deleteStay.bind(null, s.id)} />
            </div>
          </li>
        ))}
        {stays.length === 0 && (
          <li className="rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">No stays yet.</li>
        )}
      </ul>
    </div>
  );
}

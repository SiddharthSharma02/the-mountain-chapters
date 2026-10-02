import { createClient } from "@/lib/supabase/server";
import { setMessageStatus, deleteMessage } from "@/lib/actions/admin-messages";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Messages</h1>
      <p className="mt-1 text-sm text-navy/60">
        Contact form submissions from your website.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {messages?.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-navy">{m.name}</p>
                <p className="text-xs text-navy/60">
                  {m.email} {m.phone ? `· ${m.phone}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-cream-dark px-2.5 py-1 text-xs font-medium text-navy/70">
                {m.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-navy/80">{m.message}</p>
            <div className="mt-3 flex gap-4">
              {m.status !== "read" && (
                <form action={setMessageStatus.bind(null, m.id, "read")}>
                  <button className="text-sm font-medium text-gold-dark hover:text-gold">
                    Mark as Read
                  </button>
                </form>
              )}
              {m.status !== "archived" && (
                <form action={setMessageStatus.bind(null, m.id, "archived")}>
                  <button className="text-sm font-medium text-navy/60 hover:text-navy">
                    Archive
                  </button>
                </form>
              )}
              <DeleteButton action={deleteMessage.bind(null, m.id)} />
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <p className="rounded-2xl border border-dashed border-navy/20 p-8 text-center text-navy/50">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}

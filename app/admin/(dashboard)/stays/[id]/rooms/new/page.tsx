import { notFound } from "next/navigation";
import { RoomForm } from "@/components/admin/stays/room-form";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/stays/validation";

export default async function NewRoomPage({ params }: PageProps<"/admin/stays/[id]/rooms/new">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: stay } = await supabase.from("stays").select("id, name").eq("id", id).maybeSingle();
  if (!stay) notFound();
  // The id is minted up front so images upload straight into stays/{stayId}/rooms/{roomId}/.
  return <RoomForm stayId={stay.id} stayName={stay.name} roomId={crypto.randomUUID()} room={null} />;
}

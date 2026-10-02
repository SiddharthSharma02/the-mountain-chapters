import { notFound } from "next/navigation";
import { RoomForm } from "@/components/admin/stays/room-form";
import { createClient } from "@/lib/supabase/server";
import { normalizeStay } from "@/lib/stays/normalize";
import { STAY_FULL_SELECT, type RawStayRow } from "@/lib/stays/types";
import { isUuid } from "@/lib/stays/validation";

export default async function EditRoomPage({ params }: PageProps<"/admin/stays/[id]/rooms/[roomId]">) {
  const { id, roomId } = await params;
  if (!isUuid(id) || !isUuid(roomId)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("stays").select(STAY_FULL_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();
  const stay = normalizeStay(data as RawStayRow, { includeInactive: true });
  const room = stay.rooms.find((r) => r.id === roomId);
  if (!room) notFound();
  return <RoomForm stayId={stay.id} stayName={stay.name} roomId={room.id} room={room} />;
}

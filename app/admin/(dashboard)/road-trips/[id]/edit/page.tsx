import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoadTripForm } from "@/components/admin/road-trip-form";
import { updateRoadTripChapter } from "@/lib/actions/admin-road-trips";

export default async function EditRoadTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: chapter } = await supabase
    .from("road_trip_chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (!chapter) notFound();

  const action = updateRoadTripChapter.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Edit Road Trip Chapter</h1>
      <div className="mt-6">
        <RoadTripForm chapter={chapter} action={action} />
      </div>
    </div>
  );
}

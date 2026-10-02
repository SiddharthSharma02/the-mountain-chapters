import { RoadTripForm } from "@/components/admin/road-trip-form";
import { createRoadTripChapter } from "@/lib/actions/admin-road-trips";

export default function NewRoadTripPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">New Road Trip Chapter</h1>
      <div className="mt-6">
        <RoadTripForm action={createRoadTripChapter} />
      </div>
    </div>
  );
}

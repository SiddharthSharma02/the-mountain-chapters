import { RouteForm } from "@/components/admin/route-form";
import { createMapRoute } from "@/lib/actions/admin-routes";

export default function NewRoutePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">New Route</h1>
      <div className="mt-6">
        <RouteForm action={createMapRoute} />
      </div>
    </div>
  );
}

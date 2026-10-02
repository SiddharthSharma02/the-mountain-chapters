import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RouteForm } from "@/components/admin/route-form";
import { updateMapRoute } from "@/lib/actions/admin-routes";

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: route } = await supabase
    .from("map_routes")
    .select("*")
    .eq("id", id)
    .single();

  if (!route) notFound();

  const action = updateMapRoute.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Edit Route</h1>
      <div className="mt-6">
        <RouteForm route={route} action={action} />
      </div>
    </div>
  );
}

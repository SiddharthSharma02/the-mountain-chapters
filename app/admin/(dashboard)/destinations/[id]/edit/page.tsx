import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DestinationForm } from "@/components/admin/destination-form";
import { updateDestination } from "@/lib/actions/admin-destinations";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: destination } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .single();

  if (!destination) notFound();

  const action = updateDestination.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">
        Edit Destination
      </h1>
      <div className="mt-6">
        <DestinationForm destination={destination} action={action} />
      </div>
    </div>
  );
}

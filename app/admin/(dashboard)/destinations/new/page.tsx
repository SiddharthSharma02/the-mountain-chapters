import { DestinationForm } from "@/components/admin/destination-form";
import { createDestination } from "@/lib/actions/admin-destinations";

export default function NewDestinationPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">
        New Destination
      </h1>
      <div className="mt-6">
        <DestinationForm action={createDestination} />
      </div>
    </div>
  );
}

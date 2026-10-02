import type { MapRoute } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";

export function RouteForm({
  route,
  action,
}: {
  route?: MapRoute;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Route Name">
        <input name="name" required defaultValue={route?.name} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={route?.description ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Stops (comma separated)">
        <input
          name="points"
          defaultValue={route?.points?.map((p) => p.name).join(", ") ?? ""}
          placeholder="Chandigarh, Shimla, Narkanda, Sangla, Kaza"
          className={inputClass}
        />
      </Field>
      <Field label="Sort Order">
        <input
          name="sort_order"
          type="number"
          defaultValue={route?.sort_order ?? 0}
          className={inputClass}
        />
      </Field>
      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-light"
      >
        {route ? "Save Changes" : "Create Route"}
      </button>
    </form>
  );
}

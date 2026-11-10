import type { MapRoute } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";

export function RouteForm({
  route,
  action,
}: {
  route?: MapRoute;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
}) {
  return (
    <AdminForm action={action} className="flex max-w-xl flex-col gap-4">
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
      <SubmitButton>{route ? "Save Changes" : "Create Route"}</SubmitButton>
    </AdminForm>
  );
}

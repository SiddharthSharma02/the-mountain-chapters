import type { Destination } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";

export function DestinationForm({
  destination,
  action,
}: {
  destination?: Destination;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={destination?.name}
          className={inputClass}
        />
      </Field>
      <Field label="Slug">
        <input
          name="slug"
          required
          defaultValue={destination?.slug}
          placeholder="e.g. narkanda"
          className={inputClass}
        />
      </Field>
      <Field label="State">
        <input
          name="state"
          defaultValue={destination?.state ?? "Himachal Pradesh"}
          className={inputClass}
        />
      </Field>
      <Field label="Tagline">
        <input
          name="tagline"
          defaultValue={destination?.tagline ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={destination?.description ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cover Image">
        {destination?.cover_image ? (
          <img
            src={destination.cover_image}
            alt="Current cover"
            className="mb-2 h-40 w-full rounded-lg object-cover"
          />
        ) : null}
        <input
          name="cover_image_file"
          type="file"
          accept="image/*"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-navy/50">Max 3MB. Leave empty to keep existing image.</p>
      </Field>
      <Field label="Or use Cover Image URL">
        <input
          name="cover_image_url"
          type="url"
          defaultValue={destination?.cover_image ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>
      <Field label="Sort Order">
        <input
          name="sort_order"
          type="number"
          defaultValue={destination?.sort_order ?? 0}
          className={inputClass}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          name="is_popular"
          defaultChecked={destination?.is_popular}
        />
        Show in Popular Destinations
      </label>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-light"
      >
        {destination ? "Save Changes" : "Create Destination"}
      </button>
    </form>
  );
}

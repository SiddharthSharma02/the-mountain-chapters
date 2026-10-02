import type { RoadTripChapter } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";

export function RoadTripForm({
  chapter,
  action,
}: {
  chapter?: RoadTripChapter;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Title">
        <input name="title" required defaultValue={chapter?.title} className={inputClass} />
      </Field>
      <Field label="Slug">
        <input name="slug" required defaultValue={chapter?.slug} className={inputClass} />
      </Field>
      <Field label="Step Number">
        <input
          name="step_number"
          type="number"
          defaultValue={chapter?.step_number ?? 0}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={chapter?.description ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cover Image">
        {chapter?.cover_image ? (
          <img
            src={chapter.cover_image}
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
          defaultValue={chapter?.cover_image ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Distance (km)">
          <input
            name="distance_km"
            type="number"
            step="0.1"
            defaultValue={chapter?.distance_km ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Duration (days)">
          <input
            name="duration_days"
            type="number"
            defaultValue={chapter?.duration_days ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Route Stops (comma separated)">
        <input
          name="route"
          defaultValue={chapter?.route?.map((p) => p.name).join(", ") ?? ""}
          placeholder="Shimla, Narkanda, Kalpa, Spiti Valley"
          className={inputClass}
        />
      </Field>
      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-light"
      >
        {chapter ? "Save Changes" : "Create Chapter"}
      </button>
    </form>
  );
}

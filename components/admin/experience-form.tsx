import type { Experience } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";

export function ExperienceForm({
  experience,
  action,
}: {
  experience?: Experience;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
}) {
  return (
    <AdminForm action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Title">
        <input name="title" required defaultValue={experience?.title} className={inputClass} />
      </Field>
      <Field label="Slug">
        <input name="slug" required defaultValue={experience?.slug} className={inputClass} />
      </Field>
      <Field label="Icon (emoji)">
        <input name="icon" defaultValue={experience?.icon ?? ""} placeholder="🥾" className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={experience?.description ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cover Image">
        {experience?.cover_image ? (
          <img
            src={experience.cover_image}
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
          defaultValue={experience?.cover_image ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Sort Order">
        <input
          name="sort_order"
          type="number"
          defaultValue={experience?.sort_order ?? 0}
          className={inputClass}
        />
      </Field>
      <SubmitButton>{experience ? "Save Changes" : "Create Experience"}</SubmitButton>
    </AdminForm>
  );
}

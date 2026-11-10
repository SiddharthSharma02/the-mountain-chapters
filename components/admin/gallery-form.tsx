import type { GalleryImage } from "@/lib/types/database";
import { Field, inputClass } from "@/components/admin/form-field";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";

export function GalleryForm({
  image,
  action,
}: {
  image?: GalleryImage;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
}) {
  return (
    <AdminForm action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Image">
        {image?.image_url ? (
          <img
            src={image.image_url}
            alt="Current gallery image"
            className="mb-2 h-40 w-full rounded-lg object-cover"
          />
        ) : null}
        <input
          name="image_file"
          type="file"
          accept="image/*"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-navy/50">Max 3MB. Leave empty to keep existing image.</p>
      </Field>
      <Field label="Or use Image URL">
        <input
          name="image_url"
          type="url"
          defaultValue={image?.image_url}
          className={inputClass}
        />
      </Field>
      <Field label="Caption">
        <input name="caption" defaultValue={image?.caption ?? ""} className={inputClass} />
      </Field>
      <Field label="Category">
        <input name="category" defaultValue={image?.category ?? ""} className={inputClass} />
      </Field>
      <Field label="Sort Order">
        <input
          name="sort_order"
          type="number"
          defaultValue={image?.sort_order ?? 0}
          className={inputClass}
        />
      </Field>
      <SubmitButton>{image ? "Save Changes" : "Add Image"}</SubmitButton>
    </AdminForm>
  );
}

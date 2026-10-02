import { GalleryForm } from "@/components/admin/gallery-form";
import { createGalleryImage } from "@/lib/actions/admin-gallery";

export default function NewGalleryImagePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">New Gallery Image</h1>
      <div className="mt-6">
        <GalleryForm action={createGalleryImage} />
      </div>
    </div>
  );
}

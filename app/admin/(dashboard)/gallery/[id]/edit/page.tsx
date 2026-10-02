import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryForm } from "@/components/admin/gallery-form";
import { updateGalleryImage } from "@/lib/actions/admin-gallery";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("id", id)
    .single();

  if (!image) notFound();

  const action = updateGalleryImage.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Edit Gallery Image</h1>
      <div className="mt-6">
        <GalleryForm image={image} action={action} />
      </div>
    </div>
  );
}

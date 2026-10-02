import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteGalleryImage } from "@/lib/actions/admin-gallery";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">Gallery</h1>
        <Link
          href="/admin/gallery/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          + New Image
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images?.map((img) => (
          <div key={img.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-navy/5">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <Image src={img.image_url} alt={img.caption || ""} fill className="object-cover" />
            </div>
            <p className="mt-2 truncate text-xs text-navy/60">{img.caption}</p>
            <div className="mt-2 flex justify-between">
              <Link
                href={`/admin/gallery/${img.id}/edit`}
                className="text-xs font-medium text-gold-dark hover:text-gold"
              >
                Edit
              </Link>
              <DeleteButton action={deleteGalleryImage.bind(null, img.id)} />
            </div>
          </div>
        ))}
        {(!images || images.length === 0) && (
          <p className="col-span-full py-8 text-center text-navy/50">
            No gallery images yet.
          </p>
        )}
      </div>
    </div>
  );
}

import { GalleryGrid } from "@/components/site/gallery-grid";
import { getGalleryImages } from "@/lib/data/content";

export const metadata = { title: "Gallery | The Mountain Chapters" };

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        Gallery
      </h1>
      <p className="mt-2 max-w-xl text-navy/70">
        A visual chapter of the mountains, valleys and moments we&apos;ve
        captured along the way. Tap any photo to view it full screen.
      </p>

      {images.length > 0 ? (
        <GalleryGrid images={images} />
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-navy/20 p-10 text-center text-navy/50">
          No gallery images yet. Add some from the admin dashboard.
        </div>
      )}
    </div>
  );
}

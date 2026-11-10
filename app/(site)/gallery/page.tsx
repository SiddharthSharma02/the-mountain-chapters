import { EmptyState, PageHeader } from "@/components/site/page-header";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { getGalleryImages } from "@/lib/data/content";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <>
      <PageHeader
        eyebrow="Photo journal"
        title="The mountains, as we've seen them"
        intro="Tap any photo to see it full screen."
      />
      {images.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <GalleryGrid images={images} />
        </div>
      ) : (
        <EmptyState message="Our photo journal is coming soon." />
      )}
    </>
  );
}

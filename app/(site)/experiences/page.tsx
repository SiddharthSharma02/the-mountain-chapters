import { EmptyState, PageHeader } from "@/components/site/page-header";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { getExperiences } from "@/lib/data/content";

export const metadata = { title: "Experiences" };

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <>
      <PageHeader
        eyebrow="Things to do"
        title="Between the drives"
        intro="Treks, village walks, orchard mornings and off-road days, arranged with local hosts."
      />
      {experiences.length > 0 ? (
        <div className="mx-auto grid max-w-7xl gap-x-6 gap-y-12 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          {experiences.map((e) => (
            <article key={e.id} className="flex flex-col">
              {e.cover_image && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-cream-dark">
                  <Image
                    src={e.cover_image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
              )}
              <h2 className={`${e.cover_image ? "mt-4" : ""} px-1 font-serif text-2xl leading-snug text-navy`}>{e.title}</h2>
              {e.description && <p className="mt-2 px-1 text-[15px] leading-relaxed text-navy/70">{e.description}</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState message="Experiences are coming soon. Tell us what you'd love to do." />
      )}
    </>
  );
}

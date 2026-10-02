import Image from "next/image";

export const metadata = { title: "About | The Mountain Chapters" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy sm:text-4xl">
        About The Mountain Chapters
      </h1>
      <p className="mt-4 max-w-2xl text-navy/70">
        We are a Himachal-based travel collective curating authentic
        Himalayan experiences — handpicked stays, epic road trips and
        community-driven travel stories. Every journey, we believe, is a new
        chapter waiting to be written.
      </p>

      <div className="mt-10 relative aspect-16/7 w-full overflow-hidden rounded-3xl">
        <Image
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop"
          alt="Himalayan mountains"
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-bold text-navy">Our Mission</p>
          <p className="mt-2 text-sm text-navy/70">
            Making the Himalayas accessible without losing their soul —
            curated over commercial.
          </p>
        </div>
        <div>
          <p className="font-serif text-xl font-bold text-navy">
            Local First
          </p>
          <p className="mt-2 text-sm text-navy/70">
            Every stay and experience is run by locals who know these
            mountains best.
          </p>
        </div>
        <div>
          <p className="font-serif text-xl font-bold text-navy">
            Community Stories
          </p>
          <p className="mt-2 text-sm text-navy/70">
            Real travellers, real chapters — shared to inspire the next
            journey.
          </p>
        </div>
      </div>
    </div>
  );
}

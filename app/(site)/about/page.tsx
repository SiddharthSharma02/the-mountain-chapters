import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { SafeImage as Image } from "@/components/ui/safe-image";

export const metadata = { title: "About" };

const VALUES = [
  { title: "Curated, not commercial", body: "We'd rather list ten stays we love than a hundred we don't. Every place is somewhere we've been." },
  { title: "Local first", body: "Stays and experiences run by people from these valleys, who know the roads, the weather and the best tea stop." },
  { title: "Real stories", body: "Travellers share their own chapters here, reviewed by us and published in their words." },
];

export default function AboutPage() {
  return (
    <>
      <header className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <p className="eyebrow">About us</p>
        <h1 className="mt-4 max-w-4xl font-serif text-[40px] leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
          A small Himalayan travel collective from Narkanda
        </h1>
      </header>

      <div className="px-3 sm:px-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-cream-dark sm:aspect-[16/7] sm:rounded-[32px]">
          <Image src="/hero.jpg" alt="Morning light over the Himalayan ranges" fill sizes="100vw" className="object-cover" />
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <p className="font-serif text-2xl leading-[1.45] text-navy sm:text-[30px]">
          We curate Himalayan journeys: handpicked stays, road trips planned chapter by chapter, and stories from
          the travellers who take them. Every journey, we believe, is a new chapter waiting to be written.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 sm:px-6 md:grid-cols-3 md:gap-12 lg:px-8">
        {VALUES.map((v) => (
          <div key={v.title} className="border-t border-navy/15 pt-6">
            <h2 className="font-serif text-2xl text-navy">{v.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-navy/70">{v.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-navy p-8 text-cream sm:flex-row sm:items-center sm:p-12">
          <p className="max-w-lg font-serif text-3xl leading-tight">Ready to start your chapter?</p>
          <Link
            href="/contact"
            className="inline-flex min-h-14 items-center gap-2 rounded-full bg-gold px-8 text-[15px] font-semibold text-navy hover:bg-cream"
          >
            Plan your trip <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { DestinationCard } from "@/components/site/destination-card";
import { StayCard } from "@/components/site/stay-card";
import { StoryCard } from "@/components/site/story-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { HeroMotion } from "@/components/site/hero-motion";
import { StayMotion } from "@/components/stays/stay-motion";
import { ArrowDown, ArrowRight, Cabin, Compass, Road } from "@/components/site/icons";
import { SafeImage } from "@/components/ui/safe-image";
import {
  getPopularDestinations,
  getFeaturedStays,
  getExperiences,
  getRoadTripChapters,
  getApprovedStories,
  getMapRoutes,
} from "@/lib/data/content";

/** What we actually do. No invented numbers or claims. */
const PILLARS = [
  {
    icon: Cabin,
    title: "Stays we've slept in",
    body: "Homestays, cottages and small lodges, chosen for the people who run them and the view from the window.",
  },
  {
    icon: Road,
    title: "Roads, chapter by chapter",
    body: "Routes through Kinnaur and Spiti broken into days you can actually drive, with the stops worth making.",
  },
  {
    icon: Compass,
    title: "Planned by locals",
    body: "We're based in Narkanda. Tell us your dates and pace, and we'll shape the trip around them.",
  },
];

export default async function Home() {
  const [destinations, stays, experiences, chapters, stories, routes] = await Promise.all([
    getPopularDestinations(),
    getFeaturedStays(),
    getExperiences(),
    getRoadTripChapters(),
    getApprovedStories(3),
    getMapRoutes(),
  ]);
  const leadChapter = chapters[0];

  return (
    <>
      <Navbar overlay />
      <main className="flex-1">
        {/* ---------- Hook ---------- */}
        <section data-hero className="relative isolate flex h-svh min-h-[600px] items-end overflow-hidden bg-navy">
          <div data-hero-media className="absolute inset-0 -z-10 will-change-transform">
            <Image
              src="/hero-phone.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 639px) 100vw, 1px"
              className="object-cover object-[68%_center] sm:hidden"
            />
            <Image
              src="/hero.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 640px) 100vw, 1px"
              className="hidden object-cover sm:block"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy from-10% via-navy/75 via-50% to-navy/10 sm:from-0% sm:via-0% sm:bg-gradient-to-r sm:from-navy/90 sm:via-navy/45 sm:to-navy/5" />
          <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-navy/60 to-transparent" />

          <div data-hero-copy className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
            <div className="max-w-2xl text-cream">
              <p data-hero-line className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                Narkanda · Kinnaur · Spiti
              </p>
              <h1 className="mt-5 font-serif text-[44px] leading-[1.02] sm:text-7xl lg:text-[88px]">
                <span data-hero-line className="block">Every journey</span>
                <span data-hero-line className="block">
                  begins a new <em className="text-gold">chapter</em>
                </span>
              </h1>
              <p data-hero-line className="mt-6 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
                Handpicked Himalayan stays and road trips, planned by people who live here.
              </p>
              <div data-hero-line className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gold px-8 text-[15px] font-semibold text-navy transition-colors hover:bg-cream"
                >
                  Plan your trip <ArrowRight />
                </Link>
                <Link
                  href="/stays"
                  className="inline-flex min-h-14 items-center justify-center rounded-full px-8 text-[15px] font-semibold text-cream ring-1 ring-cream/40 backdrop-blur-sm transition-colors hover:bg-cream/10"
                >
                  Find a stay
                </Link>
              </div>
            </div>
          </div>

          <a
            href="#intro"
            aria-label="Scroll to content"
            className="absolute bottom-6 right-5 hidden h-12 w-12 items-center justify-center rounded-full text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream/10 sm:right-8 sm:flex"
          >
            <ArrowDown />
          </a>
        </section>

        {/* ---------- Value ---------- */}
        <section id="intro" className="mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
          <p data-reveal="text" className="max-w-4xl font-serif text-[30px] leading-[1.2] text-navy sm:text-5xl sm:leading-[1.12]">
            Slow mornings above the clouds, apple orchards, and roads that cling to the mountain.{" "}
            <span className="text-navy/45">We help you travel them well.</span>
          </p>
          <div className="mt-16 grid gap-10 sm:mt-20 md:grid-cols-3 md:gap-12">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} data-reveal="text" className="border-t border-navy/15 pt-6">
                <Icon className="h-7 w-7 text-gold-dark" />
                <h2 className="mt-5 font-serif text-2xl text-navy">{title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-navy/70">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Destinations ---------- */}
        {destinations.length > 0 && (
          <section className="pb-24 sm:pb-32">
            <SectionHead eyebrow="Where to go" title="Valleys worth the drive" href="/destinations" cta="All destinations" />
            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:mx-auto sm:grid sm:max-w-7xl sm:grid-cols-2 sm:overflow-visible sm:px-6 lg:grid-cols-3 lg:px-8">
              {destinations.slice(0, 8).map((d, i) => {
                // Bento: the first card spans two columns when that keeps the rows full.
                const wide = i === 0 && Math.min(destinations.length, 8) % 3 === 2;
                return (
                  <div
                    key={d.id}
                    data-reveal="image"
                    className={`w-[78vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none ${wide ? "sm:col-span-2" : ""}`}
                  >
                    <DestinationCard
                      destination={d}
                      featured={wide}
                      sizes={wide ? "(min-width: 1024px) 62vw, (min-width: 640px) 90vw, 78vw" : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- Stays ---------- */}
        {stays.length > 0 && (
          <section className="pb-24 sm:pb-32">
            <SectionHead eyebrow="Where to stay" title="Featured stays" href="/stays" cta="All stays" />
            <div className="mx-auto grid max-w-7xl gap-x-6 gap-y-12 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
              {stays.slice(0, 6).map((s) => (
                <div key={s.id} data-reveal="text">
                  <StayCard stay={s} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Road trips ---------- */}
        {chapters.length > 0 && (
          <section className="bg-navy text-cream">
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="eyebrow !text-gold">Road trips</p>
                <h2 className="mt-4 font-serif text-[40px] leading-[1.05] sm:text-6xl">The road, in chapters</h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-cream/70">
                  Each chapter is a day or two of driving with a place to rest at the end of it.
                </p>
                {leadChapter && (
                  <div data-reveal="image" className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[24px] bg-navy-light lg:block">
                    <SafeImage src={leadChapter.cover_image} alt="" fill sizes="40vw" className="object-cover opacity-90" />
                  </div>
                )}
              </div>
              <div>
                <ol className="divide-y divide-cream/10 border-y border-cream/10">
                  {chapters.slice(0, 6).map((c) => (
                    <li key={c.id} data-reveal="text">
                      <Link href={`/road-trips/${c.slug}`} className="group flex min-h-24 items-center gap-5 py-6">
                        <span className="w-10 shrink-0 font-serif text-2xl text-gold">
                          {String(c.step_number).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-2xl leading-snug transition-colors group-hover:text-gold sm:text-[28px]">
                            {c.title}
                          </span>
                          {(c.distance_km || c.duration_days) && (
                            <span className="mt-1 block text-sm text-cream/55">
                              {[c.distance_km && `${c.distance_km} km`, c.duration_days && `${c.duration_days} ${c.duration_days === 1 ? "day" : "days"}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </span>
                        <ArrowRight className="h-5 w-5 shrink-0 text-cream/40 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                      </Link>
                    </li>
                  ))}
                </ol>
                {routes.length > 0 && (
                  <div className="mt-14">
                    <p className="eyebrow !text-cream/50">Popular routes</p>
                    <ul className="mt-5 space-y-5">
                      {routes.slice(0, 3).map((r) => (
                        <li key={r.id}>
                          <p className="font-medium text-cream">{r.name}</p>
                          {r.points.length > 0 && (
                            <p className="mt-1 text-sm leading-relaxed text-cream/60">
                              {r.points.map((p) => p.name).join("  →  ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href="/road-trips"
                  className="mt-12 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream hover:text-navy"
                >
                  All road trips <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ---------- Experiences ---------- */}
        {experiences.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
              <div data-reveal="text">
                <p className="eyebrow">Things to do</p>
                <h2 className="mt-4 font-serif text-[40px] leading-[1.05] text-navy sm:text-6xl">Between the drives</h2>
                <Link
                  href="/experiences"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4"
                >
                  All experiences <ArrowRight />
                </Link>
              </div>
              <ul className="flex flex-wrap content-start gap-3" data-reveal="text">
                {experiences.slice(0, 10).map((e) => (
                  <li
                    key={e.id}
                    className="inline-flex min-h-12 items-center rounded-full bg-white px-5 text-[15px] text-navy ring-1 ring-navy/10"
                  >
                    {e.title}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- Proof: real stories only ---------- */}
        {stories.length > 0 && (
          <section className="border-t border-navy/10 py-24 sm:py-32">
            <SectionHead eyebrow="From our travellers" title="Stories from the road" href="/stories" cta="All stories" />
            <div className="mx-auto grid max-w-7xl gap-x-6 gap-y-12 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
              {stories.map((s) => (
                <div key={s.id} data-reveal="text">
                  <StoryCard story={s} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- CTA ---------- */}
        <section className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-navy px-6 py-20 text-center text-cream sm:px-10 sm:py-28">
            <Image src="/hero.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 to-navy" />
            <p className="eyebrow !text-gold">Start your chapter</p>
            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-[40px] leading-[1.05] sm:text-6xl">
              Tell us where you&apos;d like to wake up
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-cream/75">
              Share your dates and how you like to travel. We reply within a day with ideas and availability.
            </p>
            <Link
              href="/contact"
              className="mt-9 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gold px-9 text-[15px] font-semibold text-navy transition-colors hover:bg-cream"
            >
              Plan your trip <ArrowRight />
            </Link>
            <div className="mx-auto mt-16 max-w-md border-t border-cream/15 pt-10">
              <p className="text-sm text-cream/70">Or get new stays and routes by email, a few times a year.</p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <HeroMotion />
      <StayMotion />
    </>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-5 sm:mb-14 sm:px-6 lg:px-8">
      <div data-reveal="text">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 font-serif text-[36px] leading-[1.05] text-navy sm:text-6xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4 hover:text-gold-dark"
      >
        <span className="sm:hidden">View all</span>
        <span className="hidden sm:inline">{cta}</span> <ArrowRight />
      </Link>
    </div>
  );
}

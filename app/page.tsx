import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { DestinationCard } from "@/components/site/destination-card";
import { StayCard } from "@/components/site/stay-card";
import { StoryCard } from "@/components/site/story-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import {
  getPopularDestinations,
  getFeaturedStays,
  getExperiences,
  getRoadTripChapters,
  getApprovedStories,
  getMapRoutes,
} from "@/lib/data/content";

const TRUST_ITEMS = [
  { icon: "🌲", title: "Handpicked Stays", desc: "Comfort in the lap of nature" },
  { icon: "🧭", title: "Curated Experiences", desc: "Authentic & unforgettable" },
  { icon: "🚙", title: "Road Trip Experts", desc: "Scenic routes, local insights" },
  { icon: "📞", title: "24/7 Support", desc: "We're with you, always" },
];

const MOUNTAIN_DIVIDER = "▲ ▲ ▲";

export default async function Home() {
  const [destinations, stays, experiences, chapters, stories, routes] =
    await Promise.all([
      getPopularDestinations(),
      getFeaturedStays(),
      getExperiences(),
      getRoadTripChapters(),
      getApprovedStories(3),
      getMapRoutes(),
    ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex h-dvh min-h-[560px] items-end overflow-hidden sm:h-auto sm:min-h-[640px] sm:items-center lg:min-h-[760px]">
          <Image
            src="/phone-hero.png"
            alt="A traveler overlooking the Himalayan mountains at sunrise"
            fill
            priority
            sizes="(max-width: 639px) 100vw, 0px"
            className="object-cover object-[68%_center] sm:hidden"
          />
          <Image
            src="/Hero.png"
            alt="A traveler overlooking the Himalayan mountains at sunrise"
            fill
            priority
            sizes="(max-width: 639px) 0px, 100vw"
            className="hidden object-cover sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent sm:bg-gradient-to-r sm:from-navy/85 sm:via-navy/55 sm:to-navy/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold sm:text-xs">
                Travel · Stay · Stories
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-cream sm:mt-4 sm:text-5xl lg:text-6xl">
                Every Journey Begins a New{" "}
                <span className="text-gold">Chapter</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-cream/80 sm:mt-5 sm:text-base">
                Curated stays, epic road trips and unforgettable stories from
                the Himalayas.
              </p>
              <p
                aria-hidden
                className="mt-5 text-sm tracking-[0.4em] text-gold/80 sm:mt-6"
              >
                {MOUNTAIN_DIVIDER}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                <Link
                  href="/destinations"
                  className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-xl sm:px-6 sm:py-3"
                >
                  <span aria-hidden>🧭</span>
                  Explore Destinations
                </Link>
                <Link
                  href="/stays"
                  className="flex items-center gap-2 rounded-full border border-cream/40 bg-cream/10 px-5 py-2.5 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-cream/20 hover:text-gold sm:px-6 sm:py-3"
                >
                  <span aria-hidden>🚙</span>
                  Book Your Stay
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-cream/70 sm:hidden">
            <span aria-hidden className="text-xl">⌄</span>
          </div>
        </section>

        {/* Trust bar */}
        <section className="relative overflow-hidden border-y border-navy/10 bg-cream-dark/40 py-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream-dark/80 to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream-dark/80 to-transparent sm:w-24" />
          <div className="animate-marquee flex w-max gap-12 hover:[animation-play-state:paused] sm:gap-16">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className="flex items-center gap-3 whitespace-nowrap"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {item.title}
                  </p>
                  <p className="text-xs text-navy/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
              Popular Destinations
            </h2>
            <Link
              href="/destinations"
              className="text-sm font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
            >
              View All Destinations →
            </Link>
          </div>
          {destinations.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {destinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          ) : (
            <EmptyState label="No popular destinations yet. Add some from the admin dashboard." />
          )}
        </section>

        {/* Featured Stays */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
              Featured Stays
            </h2>
            <Link
              href="/stays"
              className="text-sm font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
            >
              View All Stays →
            </Link>
          </div>
          {stays.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stays.map((s) => (
                <StayCard key={s.id} stay={s} />
              ))}
            </div>
          ) : (
            <EmptyState label="No featured stays yet. Add some from the admin dashboard." />
          )}
        </section>

        {/* Road Trip Chapters + Experiences */}
        <section className="mx-auto grid max-w-7xl items-start gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl bg-navy p-6 text-cream">
            <h3 className="font-serif text-lg font-bold">
              Road Trip Chapters
            </h3>
            <ul className="mt-4 space-y-3">
              {chapters.length > 0 ? (
                chapters.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 text-sm">
                    <span className="text-gold">
                      {String(c.step_number).padStart(2, "0")}
                    </span>
                    <Link href={`/road-trips/${c.slug}`} className="hover:text-gold">
                      {c.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-cream/60">Coming soon.</li>
              )}
            </ul>
            <Link
              href="/road-trips"
              className="mt-5 inline-block text-xs font-semibold uppercase tracking-wide text-gold hover:text-gold-dark"
            >
              Explore All Road Trips →
            </Link>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="font-serif text-lg font-bold text-navy">
              Experiences
            </h3>
            <ul className="mt-4 space-y-3">
              {experiences.length > 0 ? (
                experiences.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm text-navy/80">
                    <span aria-hidden>{e.icon || "△"}</span>
                    {e.title}
                  </li>
                ))
              ) : (
                <li className="text-sm text-navy/50">Coming soon.</li>
              )}
            </ul>
            <Link
              href="/experiences"
              className="mt-5 inline-block text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
            >
              View All Experiences →
            </Link>
          </div>
        </section>

        {/* Travel Stories + Newsletter + Map Your Chapter */}
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy">
                Travel Stories
              </h2>
              <Link
                href="/stories"
                className="text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
              >
                View All →
              </Link>
            </div>
            {stories.length > 0 ? (
              <div className="space-y-3">
                {stories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            ) : (
              <EmptyState label="No stories yet. Be the first to share yours!" />
            )}
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-navy p-8 text-cream">
            <h3 className="font-serif text-xl font-bold">
              Be a Part of Our Journey
            </h3>
            <p className="mt-2 text-sm text-cream/70">
              Get travel tips, exclusive offers and new stories straight to
              your inbox.
            </p>
            <NewsletterForm />
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="font-serif text-lg font-bold text-navy">
              Map Your Chapter
            </h3>
            <p className="mt-1 text-xs text-navy/60">
              Explore popular routes
            </p>
            <ul className="mt-4 space-y-3">
              {routes.length > 0 ? (
                routes.slice(0, 4).map((r) => (
                  <li key={r.id} className="text-sm">
                    <p className="font-medium text-navy">{r.name}</p>
                    {r.points.length > 0 && (
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-navy/60">
                        {r.points.slice(0, 5).map((p, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && (
                              <span className="text-gold" aria-hidden>
                                →
                              </span>
                            )}
                            <span>{p.name}</span>
                          </span>
                        ))}
                        {r.points.length > 5 && (
                          <span className="text-navy/40">
                            +{r.points.length - 5} more
                          </span>
                        )}
                      </p>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-sm text-navy/50">Coming soon.</li>
              )}
            </ul>
            <Link
              href="/destinations"
              className="mt-5 inline-block text-xs font-semibold uppercase tracking-wide text-gold-dark hover:text-gold"
            >
              View All Routes →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-8 text-center text-sm text-navy/50">
      {label}
    </div>
  );
}

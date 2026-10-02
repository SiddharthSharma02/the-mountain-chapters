import Image from "next/image";
import Link from "next/link";
import { PinIcon, StarIcon } from "@/components/stays/icons";
import { MobileBookingBar } from "@/components/stays/mobile-booking-bar";
import { PhotoGalleryButton } from "@/components/stays/sheets";
import { StayMotion } from "@/components/stays/stay-motion";
import {
  AmenitiesSection,
  ExperienceBlock,
  FaqSection,
  FinalCta,
  GalleryBlock,
  ImageBlock,
  LocationSection,
  PropertyRules,
  QuoteBlock,
  ReviewHighlight,
  ReviewsSection,
  RoomFeature,
  RoomsSection,
  StoryBlock,
} from "@/components/stays/stay-sections";
import { enquiryHref } from "@/lib/stays/cta";
import { FALLBACK_IMAGE, IMAGE_PLACEHOLDER } from "@/lib/stays/image";
import { startingPrice } from "@/lib/stays/pricing";
import { summarizeReviews } from "@/lib/stays/reviews";
import { buildStayJsonLd, serializeJsonLd } from "@/lib/stays/seo";
import { buildStayTimeline, type TimelineBlock } from "@/lib/stays/timeline";
import type { StayProfile as Stay } from "@/lib/stays/types";

/** Section labels feed the sticky bar's "you are here" indicator. */
const LABELS: Partial<Record<TimelineBlock["kind"], string>> = {
  rooms: "Rooms",
  room: "Rooms",
  amenities: "Amenities",
  location: "Location",
  reviews: "Guest reviews",
  rules: "Property rules",
  faq: "Good to know",
  book: "Book",
};
const IDS: Partial<Record<TimelineBlock["kind"], string>> = {
  rooms: "rooms", amenities: "amenities", location: "location", reviews: "reviews", rules: "rules", faq: "faq", book: "book",
};

/**
 * The public stay page as a "Hinge profile": a dominant hero, a short identity card,
 * then one reveal per scroll — views, story, guest voices, rooms — ending in trust
 * (amenities, location, reviews, rules) and a single booking action.
 */
export function StayProfile({ stay, preview = false }: { stay: Stay; preview?: boolean }) {
  const blocks = buildStayTimeline(stay);
  const summary = summarizeReviews(stay);
  const price = startingPrice(stay);
  const enquire = enquiryHref(stay.slug);
  const photos = [...new Set([stay.heroImage, ...stay.gallery.map((g) => g.url)].filter((u): u is string => Boolean(u)))];
  const place = [stay.destination?.name, stay.destination?.state].filter(Boolean).join(", ");
  const hasFeaturedRoom = blocks.some((b) => b.kind === "room");

  const render = (b: TimelineBlock) => {
    switch (b.kind) {
      case "image": return <ImageBlock imageUrl={b.imageUrl} title={b.title} body={b.body} alt={`${stay.name} view`} />;
      case "story": return <StoryBlock title={b.title} subtitle={b.subtitle} body={b.body} imageUrl={b.imageUrl} alt={stay.name} />;
      case "experience": return <ExperienceBlock title={b.title} subtitle={b.subtitle} body={b.body} imageUrl={b.imageUrl} alt={stay.name} />;
      case "quote": return <QuoteBlock text={b.text} attribution={b.attribution} />;
      case "review": return <ReviewHighlight review={b.review} />;
      case "room": return <RoomFeature room={b.room} staySlug={stay.slug} />;
      case "gallery": return <GalleryBlock title={b.title} images={b.images} stayName={stay.name} />;
      case "rooms":
        return <RoomsSection rooms={b.rooms} fallbackPrice={b.fallbackPrice} staySlug={stay.slug} enquireHref={enquire} hasFeatured={hasFeaturedRoom} />;
      case "amenities": return <AmenitiesSection title={b.title} amenities={b.amenities} />;
      case "location": return <LocationSection stay={stay} title={b.title} />;
      case "reviews": return <ReviewsSection reviews={b.reviews} summary={b.summary} />;
      case "rules": return <PropertyRules stay={stay} />;
      case "faq": return <FaqSection faqs={b.faqs} />;
      case "book": return <FinalCta stay={stay} price={price?.amount ?? null} enquireHref={enquire} />;
    }
  };

  // The first rooms-ish block carries the #rooms anchor the sticky bar scrolls to.
  const firstRoomKey = blocks.find((b) => b.kind === "room" || b.kind === "rooms")?.key;

  return (
    <div className="pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildStayJsonLd(stay)) }} />

      {preview && (
        <p className="sticky top-0 z-[60] bg-gold px-4 py-2 text-center text-xs font-semibold text-navy">
          Preview — {stay.is_published ? "this is how guests see this stay" : "this stay is not published yet"}
        </p>
      )}

      {/* Hero: the photograph dominates the first screen; no text over the image. */}
      <section id="stay-hero" className="relative md:mx-auto md:max-w-7xl md:px-6 md:pt-4 lg:px-8">
        <div className="relative h-[68svh] min-h-[420px] max-h-[820px] w-full overflow-hidden bg-cream-dark md:h-[74vh] md:rounded-[32px]">
          <Image
            src={stay.heroImage ?? FALLBACK_IMAGE}
            alt={`${stay.name}${place ? `, ${place}` : ""}`}
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1280px) 1216px, 100vw"
            quality={75}
            placeholder={IMAGE_PLACEHOLDER}
            className="object-cover"
          />
          <div className="absolute bottom-4 right-4">
            <PhotoGalleryButton images={photos} stayName={stay.name} />
          </div>
        </div>
      </section>

      {/* Identity */}
      <header className="mx-auto max-w-2xl px-5 pt-8 text-center sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/45">
          <Link href="/stays" className="hover:text-gold-dark">Stays</Link>
          {stay.destination?.name && (
            <>
              <span aria-hidden> / </span>
              {stay.destination.slug ? (
                <Link href={`/destinations/${stay.destination.slug}`} className="hover:text-gold-dark">{stay.destination.name}</Link>
              ) : (
                stay.destination.name
              )}
            </>
          )}
        </nav>
        <h1 className="mt-4 font-serif text-[34px] font-semibold uppercase leading-[1.05] tracking-[0.04em] text-navy sm:text-5xl">
          {stay.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-navy/70">
          {summary.average !== null && (
            <a href="#reviews" className="inline-flex items-center gap-1 font-medium text-navy hover:text-gold-dark">
              <StarIcon className="h-3.5 w-3.5 text-gold" />
              {summary.average.toFixed(1)}
              <span className="font-normal text-navy/60">
                · {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </span>
            </a>
          )}
          {(stay.address || place) && (
            <span className="inline-flex items-center gap-1">
              <PinIcon className="h-3.5 w-3.5 text-gold-dark" />
              {place || stay.address}
            </span>
          )}
        </div>
        {(stay.property_type || stay.short_description) && (
          <p className="mt-4 font-serif text-lg italic text-navy/70">
            {[stay.property_type, stay.short_description].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={enquire}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-8 text-sm font-semibold text-cream transition-colors hover:bg-navy-light sm:w-auto"
          >
            Check availability
          </Link>
          {stay.rooms.length > 0 && (
            <a href="#rooms" className="flex min-h-12 items-center px-4 text-sm font-semibold text-navy underline decoration-gold underline-offset-4">
              View {stay.rooms.length} {stay.rooms.length === 1 ? "room" : "rooms"}
            </a>
          )}
        </div>
      </header>

      {/* One reveal per scroll */}
      <div className="mt-20 flex flex-col gap-24 sm:gap-28">
        {blocks.map((b) => {
          const id = b.key === firstRoomKey ? "rooms" : b.kind === "room" || b.kind === "rooms" ? undefined : IDS[b.kind];
          return (
            <section key={b.key} id={id} data-section-label={LABELS[b.kind]} className="scroll-mt-24">
              {render(b)}
            </section>
          );
        })}
      </div>

      <MobileBookingBar stayName={stay.name} price={price} hasRooms={stay.rooms.length > 0} enquireHref={enquire} />
      <StayMotion />
    </div>
  );
}

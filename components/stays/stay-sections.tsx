import Image from "next/image";
import Link from "next/link";
import { CheckIcon, PinIcon, Stars } from "@/components/stays/icons";
import { RoomCard } from "@/components/stays/room-card";
import { AmenitiesSheetButton, PhotoGalleryButton, PoliciesSheetButton } from "@/components/stays/sheets";
import { formatDistance, formatTime, googleMapsPlaceUrl, stayedOn } from "@/lib/stays/format";
import { EDITORIAL_SIZES, IMAGE_PLACEHOLDER } from "@/lib/stays/image";
import { formatINR } from "@/lib/stays/pricing";
import type { ReviewSummary } from "@/lib/stays/reviews";
import type { Amenity, FaqRow, GalleryImage, Review, Room, StayProfile } from "@/lib/stays/types";

// ---------- Shared typography ----------

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-dark">{children}</p>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title?: string | null }) {
  return (
    <div data-reveal="text" className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      {title && <h2 className="font-serif text-[28px] leading-[1.15] text-navy sm:text-4xl">{title}</h2>}
    </div>
  );
}

const column = "mx-auto w-full max-w-2xl px-5";

// ---------- Story blocks ----------

export function ImageBlock({ imageUrl, title, body, alt }: { imageUrl: string; title: string | null; body: string | null; alt: string }) {
  return (
    <figure className="mx-auto w-full max-w-5xl px-4 md:px-8">
      <div data-reveal="image" data-parallax className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-cream-dark md:aspect-[16/9]">
        <Image src={imageUrl} alt={title ?? alt} fill sizes={EDITORIAL_SIZES} quality={75} placeholder={IMAGE_PLACEHOLDER} className="object-cover" />
      </div>
      {(title || body) && (
        <figcaption
          data-reveal="text"
          className="mx-auto mt-6 max-w-xl px-1 md:relative md:z-10 md:-mt-24 md:mr-10 md:ml-auto md:max-w-md md:rounded-[28px] md:bg-cream md:p-8 md:shadow-[0_20px_60px_-30px_rgba(22,38,60,0.35)]"
        >
          {title && <p className="font-serif text-[26px] leading-tight text-navy sm:text-3xl">{title}</p>}
          {body && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-navy/75">{body}</p>}
        </figcaption>
      )}
    </figure>
  );
}

export function StoryBlock({
  title, subtitle, body, imageUrl, alt, eyebrow = "The story",
}: { title: string | null; subtitle: string | null; body: string | null; imageUrl: string | null; alt: string; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className={`${column} text-center`} data-reveal="text">
        <Eyebrow>{subtitle || eyebrow}</Eyebrow>
        {title && <h2 className="mt-4 font-serif text-[30px] leading-[1.15] text-navy sm:text-[40px]">{title}</h2>}
        {body && <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-[16px] leading-[1.75] text-navy/75">{body}</p>}
      </div>
      {imageUrl && <ImageBlock imageUrl={imageUrl} title={null} body={null} alt={title ?? alt} />}
    </div>
  );
}

export function ExperienceBlock({
  title, subtitle, body, imageUrl, alt,
}: { title: string | null; subtitle: string | null; body: string | null; imageUrl: string | null; alt: string }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-6 px-4 md:grid-cols-2 md:gap-12 md:px-8">
      {imageUrl && (
        <div data-reveal="image" className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-cream-dark">
          <Image src={imageUrl} alt={title ?? alt} fill sizes="(min-width: 768px) 460px, 92vw" quality={75} placeholder={IMAGE_PLACEHOLDER} className="object-cover" />
        </div>
      )}
      <div data-reveal="text" className="px-1">
        <Eyebrow>{subtitle || "Experience"}</Eyebrow>
        {title && <h2 className="mt-3 font-serif text-[28px] leading-tight text-navy sm:text-4xl">{title}</h2>}
        {body && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-navy/75">{body}</p>}
      </div>
    </div>
  );
}

export function QuoteBlock({ text, attribution }: { text: string; attribution: string | null }) {
  return (
    <figure className={`${column} text-center`} data-reveal="text">
      <span aria-hidden className="font-serif text-6xl leading-none text-gold">“</span>
      <blockquote className="-mt-4 font-serif text-[28px] italic leading-snug text-navy sm:text-4xl">{text}</blockquote>
      {attribution && <figcaption className="mt-5 text-sm text-navy/60">— {attribution}</figcaption>}
    </figure>
  );
}

function reviewMeta(r: Review) {
  return [stayedOn(r.stayed_on), r.traveller_type].filter(Boolean).join(" · ");
}

export function ReviewHighlight({ review }: { review: Review }) {
  const meta = reviewMeta(review);
  return (
    <figure className={`${column} flex flex-col items-center text-center`} data-reveal="text" data-testid="review-highlight">
      {review.guest_photo && (
        <div className="relative mb-6 aspect-[4/5] w-44 overflow-hidden rounded-[22px] bg-cream-dark">
          <Image src={review.guest_photo} alt={`Photo from ${review.reviewer_name}'s stay`} fill sizes="176px" className="object-cover" />
        </div>
      )}
      <Stars rating={review.rating} />
      <blockquote className="mt-5 font-serif text-[24px] leading-snug text-navy sm:text-3xl">“{review.review_text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 text-sm">
        {review.reviewer_image && (
          <Image src={review.reviewer_image} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        )}
        <span>
          <span className="font-semibold text-navy">— {review.reviewer_name}</span>
          {meta && <span className="block text-navy/55">{meta}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function RoomFeature({ room, staySlug }: { room: Room; staySlug: string }) {
  return (
    <div className={`${column} flex flex-col gap-6`}>
      <SectionHeading eyebrow="Your room" />
      <RoomCard room={room} staySlug={staySlug} />
    </div>
  );
}

export function GalleryBlock({ title, images, stayName }: { title: string | null; images: GalleryImage[]; stayName: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className={column}>
        <SectionHeading eyebrow="Gallery" title={title ?? "Around the property"} />
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-auto md:max-w-5xl md:px-8">
        {images.map((g, i) => (
          <div key={g.id} className="relative aspect-[4/5] w-[78vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-[22px] bg-cream-dark md:w-[34%]">
            <Image src={g.url} alt={g.caption ?? `${stayName} photo ${i + 1}`} fill sizes="(min-width: 768px) 340px, 78vw" loading="lazy" placeholder={IMAGE_PLACEHOLDER} className="object-cover" />
          </div>
        ))}
      </div>
      <div className={column}>
        <PhotoGalleryButton images={images.map((g) => g.url)} stayName={stayName} variant="link" />
      </div>
    </div>
  );
}

// ---------- Structured sections ----------

export function RoomsSection({
  rooms, fallbackPrice, staySlug, enquireHref, hasFeatured,
}: { rooms: Room[]; fallbackPrice: number | null; staySlug: string; enquireHref: string; hasFeatured: boolean }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
      <div className="mx-auto max-w-2xl md:max-w-none">
        <SectionHeading eyebrow="Rooms" title={hasFeatured ? "More rooms" : "Choose your room"} />
      </div>
      {rooms.length > 0 ? (
        <div className="mx-auto mt-8 grid max-w-2xl gap-14 md:max-w-none md:grid-cols-2 md:gap-x-10">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} staySlug={staySlug} />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-navy/10 bg-white/60 p-6 md:max-w-none" data-reveal="text">
          <p className="font-serif text-xl text-navy">Room details coming soon</p>
          {fallbackPrice ? (
            <p className="mt-2 text-navy/75">
              Stays from <span className="font-serif text-lg font-semibold text-navy">{formatINR(fallbackPrice)}</span> / night
            </p>
          ) : (
            <p className="mt-2 text-navy/75">Get in touch for rooms and rates.</p>
          )}
          <Link href={enquireHref} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light">
            Check availability
          </Link>
        </div>
      )}
    </div>
  );
}

const AMENITY_PREVIEW = 8;

export function AmenitiesSection({ title, amenities }: { title: string | null; amenities: Amenity[] }) {
  return (
    <div className={column}>
      <SectionHeading eyebrow="Amenities" title={title ?? "Everything you need for a comfortable stay."} />
      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-[15px] text-navy/85" data-reveal="text">
        {amenities.slice(0, AMENITY_PREVIEW).map((a) => (
          <li key={a.id} className="flex items-center gap-2.5">
            <CheckIcon className="h-4 w-4 text-gold-dark" />
            {a.name}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <AmenitiesSheetButton amenities={amenities} />
      </div>
    </div>
  );
}

export function LocationSection({ stay, title }: { stay: StayProfile; title: string | null }) {
  const { latitude: lat, longitude: lng } = stay;
  const hasMap = lat !== null && lng !== null;
  const d = 0.03;
  const place = [stay.destination?.name, stay.destination?.state].filter(Boolean).join(", ");
  const googleMapsUrl = googleMapsPlaceUrl({
    name: stay.name,
    address: stay.address,
    googlePlaceId: stay.google_place_id,
    latitude: lat,
    longitude: lng,
  });
  return (
    <div className={column}>
      <SectionHeading eyebrow="Location" title={title ?? stay.name} />
      {(stay.address || place) && (
        <p className="mt-3 flex items-start gap-2 text-navy/70" data-reveal="text">
          <PinIcon className="mt-0.5 h-4 w-4 text-gold-dark" />
          <span>{stay.address || place}</span>
        </p>
      )}
      {hasMap && (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-navy/10 bg-cream-dark" data-reveal="image">
          <iframe
            title={`Map of ${stay.name}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="aspect-[4/3] w-full md:aspect-[16/9]"
          />
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 bg-cream text-sm font-semibold text-navy hover:text-gold-dark"
          >
            Open in Google Maps
          </a>
        </div>
      )}
      {!hasMap && stay.google_place_id && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-12 items-center justify-center rounded-full border border-navy/20 px-5 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark"
        >
          Open in Google Maps
        </a>
      )}
      {stay.nearby.length > 0 && (
        <ul className="mt-8 divide-y divide-navy/10 border-y border-navy/10" data-reveal="text">
          {stay.nearby.map((n) => (
            <li key={n.id} className="flex items-baseline gap-4 py-4">
              <span className="w-20 shrink-0 font-serif text-xl text-navy">{formatDistance(n.distance_km) ?? "—"}</span>
              <span className="text-[15px] text-navy/75">{n.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReviewsSection({ reviews, summary }: { reviews: Review[]; summary: ReviewSummary }) {
  return (
    <div className="flex flex-col gap-8">
      <div className={column}>
        <SectionHeading eyebrow="Guest reviews" />
        <div className="mt-6 flex items-end gap-5" data-reveal="text">
          <p className="font-serif text-6xl leading-none text-navy">{summary.average?.toFixed(1)}</p>
          <div className="pb-1">
            <Stars rating={summary.average ?? 0} />
            <p className="mt-1 text-sm text-navy/60">
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        {summary.categories.length > 0 && (
          <dl className="mt-8 flex flex-col gap-3" data-reveal="text">
            {summary.categories.map((c) => (
              <div key={c.key} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm">
                <dt className="text-navy/70">{c.label}</dt>
                <div className="h-1 overflow-hidden rounded-full bg-navy/10" aria-hidden>
                  <div className="h-full rounded-full bg-gold" style={{ width: `${(c.average / 5) * 100}%` }} />
                </div>
                <dd className="text-right font-medium tabular-nums text-navy">{c.average.toFixed(1)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {reviews.length > 0 && (
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-auto md:w-full md:max-w-5xl md:px-8">
          {reviews.map((r) => {
            const meta = reviewMeta(r);
            return (
              <li
                key={r.id}
                data-testid="review-card"
                className="flex w-[84vw] max-w-sm shrink-0 snap-center flex-col gap-4 rounded-[24px] border border-navy/10 bg-white/70 p-6"
              >
                <Stars rating={r.rating} className="h-3.5 w-3.5" />
                <p className="line-clamp-6 text-[15px] leading-relaxed text-navy/85">“{r.review_text}”</p>
                <div className="mt-auto flex items-center gap-3 text-sm">
                  {r.reviewer_image && (
                    <Image src={r.reviewer_image} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                  )}
                  <span>
                    <span className="font-semibold text-navy">{r.reviewer_name}</span>
                    {meta && <span className="block text-navy/55">{meta}</span>}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PropertyRules({ stay }: { stay: StayProfile }) {
  const p = stay.policies;
  const rows: [string, string | null | undefined][] = [
    ["Check-in", formatTime(stay.check_in_time)],
    ["Check-out", formatTime(stay.check_out_time)],
    ["Pets", p?.pets],
    ["Smoking", p?.smoking],
    ["Children", p?.children],
  ];
  const visible = rows.filter(([, v]) => v);
  return (
    <div className={column}>
      <SectionHeading eyebrow="Property rules" />
      {visible.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-3" data-reveal="text">
          {visible.map(([k, v]) => (
            <div key={k} className="rounded-[20px] bg-cream-dark/60 px-4 py-4">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-navy/50">{k}</dt>
              <dd className="mt-1 font-serif text-lg text-navy">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6">
        <PoliciesSheetButton policies={p} checkIn={stay.check_in_time} checkOut={stay.check_out_time} />
      </div>
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: FaqRow[] }) {
  return (
    <div className={column}>
      <SectionHeading eyebrow="Good to know" title="Questions, answered" />
      <div className="mt-6 divide-y divide-navy/10 border-y border-navy/10">
        {faqs.map((f) => (
          <details key={f.id} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-navy [&::-webkit-details-marker]:hidden">
              {f.question}
              <span aria-hidden className="text-xl text-gold-dark transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pb-4 whitespace-pre-line text-[15px] leading-relaxed text-navy/75">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function FinalCta({ stay, price, enquireHref }: { stay: StayProfile; price: number | null; enquireHref: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[32px] bg-navy px-6 py-14 text-center text-cream sm:px-12" data-reveal="text">
        <Eyebrow>Ready to stay?</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-md font-serif text-[30px] leading-tight sm:text-4xl">{stay.name}</h2>
        {price && (
          <p className="mt-3 text-cream/75">
            From <span className="font-serif text-xl text-cream">{formatINR(price)}</span> / night
          </p>
        )}
        <p className="mx-auto mt-4 max-w-sm text-sm text-cream/60">
          Share your dates and we&apos;ll personally confirm availability and rates.
        </p>
        <Link href={enquireHref} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-8 text-sm font-semibold text-navy transition-colors hover:bg-cream">
          Check availability
        </Link>
      </div>
    </div>
  );
}

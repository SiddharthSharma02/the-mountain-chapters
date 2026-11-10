import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";

/** Full-bleed photo header for destination, road trip and story pages. */
export function DetailHero({
  image,
  backHref,
  backLabel,
  eyebrow,
  title,
  meta,
}: {
  image: string | null;
  backHref: string;
  backLabel: string;
  eyebrow?: string | null;
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative isolate flex min-h-[62svh] items-end overflow-hidden rounded-[28px] bg-navy sm:min-h-[70vh] sm:rounded-[32px]">
        <SafeImage src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent" />
        <div className="w-full px-5 pb-10 pt-24 text-cream sm:px-10 sm:pb-14">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.2em] text-cream/75 hover:text-gold"
          >
            ← {backLabel}
          </Link>
          {eyebrow && <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>}
          <h1 className="mt-3 max-w-4xl font-serif text-[40px] leading-[1.04] sm:text-6xl lg:text-7xl">{title}</h1>
          {meta && <div className="mt-4 text-sm text-cream/75 sm:text-base">{meta}</div>}
        </div>
      </div>
    </section>
  );
}

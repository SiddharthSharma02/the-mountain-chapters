import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";

/** Consistent intro block for every public list page. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-serif text-[40px] leading-[1.05] text-navy sm:text-6xl">{title}</h1>
      {intro && <p className="mt-5 max-w-xl text-base leading-relaxed text-navy/70 sm:text-lg">{intro}</p>}
      {children}
    </header>
  );
}

/** Shown when a list is empty. Written for guests, not admins. */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-cream-dark/60 px-6 py-14 text-center">
        <p className="mx-auto max-w-md font-serif text-2xl leading-snug text-navy">{message}</p>
        <Link
          href="/contact"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-cream hover:bg-navy-light"
        >
          Ask us directly <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-serif text-7xl font-bold text-gold sm:text-8xl">404</p>
      <p className="mt-4 font-serif text-2xl font-bold text-navy sm:text-3xl">
        This trail leads nowhere
      </p>
      <p className="mt-3 max-w-md text-navy/60">
        The page you&rsquo;re looking for has wandered off the map. Let&rsquo;s
        get you back on a path worth travelling.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark"
        >
          Back Home
        </Link>
        <Link
          href="/destinations"
          className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
        >
          Explore Destinations
        </Link>
      </div>
    </main>
  );
}

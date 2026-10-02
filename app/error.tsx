"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-serif text-5xl font-bold text-gold">Oops</p>
      <p className="mt-4 max-w-md text-navy/70">
        Something went wrong on this page. You can try again, or head back
        home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-dark"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}

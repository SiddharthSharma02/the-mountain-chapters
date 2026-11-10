"use client";

import { useActionState } from "react";
import { SpamTrap } from "@/components/site/spam-trap";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    null
  );

  return (
    <form action={formAction} className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <SpamTrap />
      <input
        type="email"
        name="email"
        required
        aria-label="Email address"
        autoComplete="email"
        placeholder="Enter your email"
        className="min-h-12 w-full flex-1 rounded-full bg-cream/10 px-5 text-sm text-cream ring-1 ring-cream/25 placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-full bg-cream px-6 text-sm font-semibold text-navy transition-colors hover:bg-gold disabled:opacity-60"
      >
        {pending ? "Subscribing…" : "Subscribe"}
      </button>
      {state && (
        <p
          role="status"
          className={`text-xs sm:basis-full ${
            state.success ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

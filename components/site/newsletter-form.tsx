"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    null
  );

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        className="w-full flex-1 rounded-full border border-cream/30 bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-dark disabled:opacity-60"
      >
        {pending ? "..." : "Subscribe"}
      </button>
      {state && (
        <p
          className={`text-xs ${
            state.success ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

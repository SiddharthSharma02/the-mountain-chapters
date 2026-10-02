"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/lib/actions/contact";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-navy">Name</label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">Phone</label>
        <input
          type="tel"
          name="phone"
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      {state && (
        <p
          className={`text-sm ${
            state.success ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream hover:bg-navy-light disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

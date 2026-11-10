"use client";

import { useActionState } from "react";
import { fieldInput, fieldLabel, formMessage, primaryButton } from "@/components/site/form-styles";
import { SpamTrap } from "@/components/site/spam-trap";
import { submitContactMessage } from "@/lib/actions/contact";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <SpamTrap />
      <label className="block">
        <span className={fieldLabel}>Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Phone</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Message</span>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className={fieldInput}
        />
      </label>
      {state && (
        <p role="status" className={formMessage(state.success)}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`mt-2 ${primaryButton}`}
      >
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { fieldInput, fieldLabel, formMessage, primaryButton } from "@/components/site/form-styles";
import { SpamTrap } from "@/components/site/spam-trap";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 py-16 sm:py-24">
      <h1 className="font-serif text-[40px] leading-[1.05] text-navy sm:text-5xl">
        Create an Account
      </h1>
      <p className="mt-2 text-sm text-navy/60">
        Join us to share your travel stories.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
      <SpamTrap />
        <label className="block">
          <span className={fieldLabel}>Full Name</span>
          <input
            type="text"
            name="full_name"
            autoComplete="name"
            required
            className={fieldInput}
          />
        </label>
        <label className="block">
          <span className={fieldLabel}>Phone Number</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            placeholder="+91 99999 99999"
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
          <span className={fieldLabel}>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={6}
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
          {pending ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-navy/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-gold-dark hover:text-gold">
          Sign in
        </Link>
      </p>
    </div>
  );
}

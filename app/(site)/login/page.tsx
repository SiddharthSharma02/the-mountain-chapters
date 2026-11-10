"use client";

import Link from "next/link";
import { useActionState } from "react";
import { fieldInput, fieldLabel, formMessage, primaryButton } from "@/components/site/form-styles";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 py-16 sm:py-24">
      <h1 className="font-serif text-[40px] leading-[1.05] text-navy sm:text-5xl">Sign In</h1>
      <p className="mt-2 text-sm text-navy/60">
        Sign in to share your travel stories with the community.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
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
            autoComplete="current-password"
            required
            className={fieldInput}
          />
        </label>
        {state && !state.success && (
          <p role="alert" className={formMessage(false)}>{state.message}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className={`mt-2 ${primaryButton}`}
        >
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-sm text-navy/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-gold-dark hover:text-gold">
          Sign up
        </Link>
      </p>
    </div>
  );
}

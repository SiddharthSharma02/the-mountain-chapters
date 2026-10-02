"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-navy">Sign In</h1>
      <p className="mt-2 text-sm text-navy/60">
        Sign in to share your travel stories with the community.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
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
          <label className="text-sm font-medium text-navy">Password</label>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        {state && !state.success && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream hover:bg-navy-light disabled:opacity-60"
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

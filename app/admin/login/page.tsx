"use client";

import { useActionState } from "react";
import { adminSignIn } from "@/lib/actions/admin-auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminSignIn, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <p className="font-serif text-2xl font-bold text-navy">
          The Mountain Chapters
        </p>
        <p className="mt-1 text-sm text-navy/60">Admin Dashboard</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
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
      </div>
    </div>
  );
}

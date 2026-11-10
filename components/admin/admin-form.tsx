"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type Result = { error: string } | undefined | void;

/** A <form> for admin actions that shows errors inline instead of crashing to the error page. */
export function AdminForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<Result>;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(async (_prev: Result, fd: FormData) => action(fd), undefined);
  return (
    <form action={formAction} className={className}>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      {children}
    </form>
  );
}

export function SubmitButton({ children, pendingLabel = "Saving…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 min-h-11 self-start rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-navy-light disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";

type Result = { error: string } | undefined | void;

/** Runs an admin action from a button and shows any error next to it. */
export function ActionButton({
  action,
  label,
  pendingLabel = "Working…",
  confirmText,
  className = "text-sm font-medium text-gold-dark hover:text-gold",
}: {
  action: () => Promise<Result>;
  label: string;
  pendingLabel?: string;
  confirmText?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          setError(null);
          startTransition(async () => {
            try {
              const res = await action();
              if (res?.error) setError(res.error);
            } catch {
              setError("That didn't work. Please try again.");
            }
          });
        }}
        className={`min-h-9 disabled:opacity-50 ${className}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {error && (
        <span role="alert" className="mt-1 max-w-56 text-xs text-red-700">
          {error}
        </span>
      )}
    </span>
  );
}

export function DeleteButton({
  action,
  confirmText = "Delete this item? This can't be undone.",
}: {
  action: () => Promise<Result>;
  confirmText?: string;
}) {
  return (
    <ActionButton
      action={action}
      label="Delete"
      pendingLabel="Deleting…"
      confirmText={confirmText}
      className="text-sm font-medium text-red-600 hover:text-red-700"
    />
  );
}

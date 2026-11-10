import "server-only";

import { requireAdminClient, type ServerClient } from "@/lib/auth/require-admin";

/** What admin form actions return. `undefined` means success (they usually redirect). */
export type AdminResult = { error: string } | undefined;

/** Turns database / upload errors into a sentence an admin can act on. */
export function friendlyError(e: unknown): string {
  const err = e as { code?: string; message?: string } | null;
  if (err?.code === "23505") return "That slug (or another unique value) is already used. Pick a different one.";
  if (err?.code === "23503") return "This item is still linked to other content. Remove those links first.";
  if (err?.code === "42501") return "You don't have permission to do that.";
  if (err?.message) return err.message;
  return "Something went wrong. Please try again.";
}

/**
 * Runs `fn` as an admin and returns `{ error }` instead of throwing, so forms can
 * show the problem inline. Call redirect() *after* this returns undefined.
 */
export async function adminMutation(fn: (supabase: ServerClient) => Promise<void>): Promise<AdminResult> {
  try {
    await fn(await requireAdminClient());
    return undefined;
  } catch (e) {
    return { error: friendlyError(e) };
  }
}

/** Throws a Supabase error so adminMutation can report it. */
export function check(error: { code?: string; message: string } | null) {
  if (error) throw error;
}

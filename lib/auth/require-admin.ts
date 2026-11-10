import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Every admin Server Action must call this first. Server Actions are public POST
 * endpoints, so the proxy and dashboard layout checks don't protect them on their own.
 */
export async function requireAdminClient(): Promise<ServerClient> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) throw new Error("Not authorised.");
  return supabase;
}

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous, cookie-less client for public content. Because it never reads cookies,
 * pages using it can be statically generated and served from the ISR cache.
 * RLS applies exactly as for a signed-out visitor.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

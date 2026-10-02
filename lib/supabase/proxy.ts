import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Timeout for auth checks in the proxy. If Supabase is unreachable
// (e.g. DNS failure, paused project), the auth client retries with
// exponential backoff and would hang for ~25s per request. This
// timeout cuts it short so pages render fast even when Supabase is down.
const AUTH_TIMEOUT_MS = 3_000;

async function getUserWithTimeout(supabase: ReturnType<ReturnType<typeof createServerClient>>) {
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), AUTH_TIMEOUT_MS)
      ),
    ]);
    return result.data.user;
  } catch {
    // Supabase unreachable or timed out — treat as not logged in.
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired — required for Server Components.
  // Wrapped in a timeout so the proxy never hangs when Supabase is down.
  const user = await getUserWithTimeout(supabase);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    try {
      const { data: profile } = await Promise.race([
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("db timeout")), AUTH_TIMEOUT_MS)
        ),
      ]);

      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch {
      // DB unreachable — redirect to login to be safe.
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function claimRole(claims: Record<string, unknown> | undefined) {
  const meta = claims?.app_metadata;
  if (!meta || typeof meta !== "object") {
    return "";
  }

  const role = (meta as { role?: unknown }).role;
  return typeof role === "string" ? role : "";
}

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();

  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  const isAuthenticated = Boolean(claims);
  const role = claimRole(claims);
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isDeskLogin = pathname.startsWith("/login");

  let isAdmin = role === "admin";

  if (isAuthenticated && role !== "learner" && (isAdminRoute || isDeskLogin) && !isAdmin) {
    const userId = typeof claims?.sub === "string" ? claims.sub : "";
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kind")
        .eq("id", userId)
        .maybeSingle();
      isAdmin = profile?.kind === "admin";
    }
  }

  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    if (isAuthenticated) {
      url.pathname = "/rekening";
      url.search = "";
      return NextResponse.redirect(url);
    }

    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isDeskLogin) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

// Cookie-free client for reading public content. Because it never touches
// cookies(), pages that only render published rows stay statically cacheable
// instead of being rendered per request.
export function createAnonClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  return createSupabaseClient(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AccountKind = "admin" | "learner";

export type SessionAccount = {
  userId: string;
  email: string;
  name: string;
  grade: number | null;
  kind: AccountKind;
  isAdmin: boolean;
};

function claimsAppRole(claims: Record<string, unknown> | undefined) {
  const meta = claims?.app_metadata;
  if (!meta || typeof meta !== "object") {
    return "";
  }

  const role = (meta as { role?: unknown }).role;
  return typeof role === "string" ? role : "";
}

export function isAdminClaims(claims: Record<string, unknown> | undefined) {
  return claimsAppRole(claims) === "admin";
}

export async function getSessionAccount(): Promise<SessionAccount | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  const claims = data.claims as Record<string, unknown>;
  const userId = typeof claims.sub === "string" ? claims.sub : "";

  if (!userId) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, grade, kind")
    .eq("id", userId)
    .maybeSingle();

  const claimRole = claimsAppRole(claims);
  const profileKind = profile?.kind === "admin" ? "admin" : "learner";
  const kind: AccountKind = claimRole === "admin" || (claimRole === "" && profileKind === "admin")
    ? "admin"
    : "learner";

  const email =
    (typeof profile?.email === "string" && profile.email) ||
    (typeof claims.email === "string" ? claims.email : "");

  return {
    userId,
    email,
    name: profile?.display_name || email.split("@")[0] || "Leerder",
    grade: typeof profile?.grade === "number" ? profile.grade : null,
    kind,
    isAdmin: kind === "admin",
  };
}

export async function requireAdmin() {
  const account = await getSessionAccount();

  if (!account) {
    redirect("/login");
  }

  if (!account.isAdmin) {
    redirect("/");
  }

  return createClient();
}

export async function requireLearner(nextPath = "/live-chat") {
  const account = await getSessionAccount();

  if (!account) {
    redirect(`/rekening?next=${encodeURIComponent(nextPath)}`);
  }

  return account;
}

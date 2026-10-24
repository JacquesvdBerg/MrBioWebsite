import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type PasswordHelpRequest = {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
};

export type LearnerAccount = {
  id: string;
  name: string;
  email: string;
  grade: number | null;
  audience: "ander" | null;
  createdAt: string;
};

export type AccountLookup =
  | { status: "found"; id: string; email: string; name: string }
  | { status: "admin" }
  | { status: "missing" }
  | { status: "no-service" }
  | { status: "error" };

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function isPlainEmail(value: string) {
  return emailPattern.test(value);
}

export function passwordHelpReason(reason: string) {
  switch (reason) {
    case "own-only":
      return "Resend stuur net na die adres van die Resend-rekening, nie na hierdie persoon nie.";
    case "no-key":
      return "Daar is geen Resend-sleutel onder Instellings nie.";
    case "from-domain":
      return "Die van-adres se domein is nie in Resend geverifieer nie.";
    case "limit":
      return "Resend se daaglikse limiet is bereik.";
    case "invalid":
      return "Resend het die sleutel afgekeur.";
    case "failed":
      return "Die e-pos het nie deurgekom nie.";
    default:
      return "Die herstel-e-pos het nie uitgekom nie.";
  }
}

export async function recordPasswordHelp(
  email: string,
  userId: string,
  reason: string,
): Promise<"saved" | "exists" | "failed"> {
  const service = createServiceClient();
  if (!service) {
    return "failed";
  }

  const { data, error: readError } = await service
    .from("password_help")
    .select("id")
    .eq("email", email)
    .eq("status", "open")
    .limit(1);

  if (readError) {
    console.error("Failed to read password help:", readError.message);
    return "failed";
  }

  if (data && data.length > 0) {
    return "exists";
  }

  const { error } = await service.from("password_help").insert({
    email,
    user_id: userId,
    reason,
    status: "open",
  });

  if (error) {
    console.error("Failed to record password help:", error.message);
    return "failed";
  }

  return "saved";
}

export async function countOpenPasswordHelp() {
  const service = createServiceClient();
  if (!service) {
    return 0;
  }

  const { count, error } = await service
    .from("password_help")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  if (error) {
    console.error("Failed to count password help:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function listOpenPasswordHelp(): Promise<PasswordHelpRequest[]> {
  const service = createServiceClient();
  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("password_help")
    .select("id, email, reason, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list password help:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    email: String(row.email ?? ""),
    reason: String(row.reason ?? "failed"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function listLearnerAccounts(): Promise<LearnerAccount[]> {
  const service = createServiceClient();
  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("profiles")
    .select("id, display_name, email, grade, audience, created_at")
    .eq("kind", "learner")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list learners:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.display_name ?? ""),
    email: String(row.email ?? ""),
    grade: typeof row.grade === "number" ? row.grade : null,
    audience: row.audience === "ander" ? "ander" : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function findAccountByEmail(email: string): Promise<AccountLookup> {
  const service = createServiceClient();
  if (!service) {
    return { status: "no-service" };
  }

  const normalized = email.trim().toLowerCase();
  const { data, error } = await service.from("profiles").select("id, kind, email, display_name");

  if (error) {
    console.error("Failed to look up an account:", error.message);
    return { status: "error" };
  }

  const match = (data ?? []).find(
    (row) => String(row.email ?? "").trim().toLowerCase() === normalized,
  );

  if (!match) {
    return { status: "missing" };
  }

  if (match.kind === "admin") {
    return { status: "admin" };
  }

  return {
    status: "found",
    id: String(match.id),
    email: normalized,
    name: String(match.display_name ?? ""),
  };
}

export async function closePasswordHelp(userId: string, email: string) {
  const service = createServiceClient();
  if (!service) {
    return;
  }

  const patch = { status: "done", resolved_at: new Date().toISOString() };
  const byUser = await service.from("password_help").update(patch).eq("status", "open").eq("user_id", userId);
  if (byUser.error) {
    console.error("Failed to close password help by user:", byUser.error.message);
  }

  const byEmail = await service.from("password_help").update(patch).eq("status", "open").eq("email", email);
  if (byEmail.error) {
    console.error("Failed to close password help by email:", byEmail.error.message);
  }
}

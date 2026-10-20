import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

// The OpenAI API key lives in public.app_secrets (service role only), set by
// the teacher under Admin > Instellings. It is never sent to the browser.

const KEY = "openai_api_key";
const CACHE_MS = 60_000;

let cached: { value: string | null; at: number } | null = null;

export class OpenAiKeyMissingError extends Error {
  constructor() {
    super("No OpenAI API key is set. Add one under Admin > Instellings.");
  }
}

function isMissingTable(error: { code?: string; message?: string } | null) {
  return Boolean(error && (error.code === "PGRST205" || error.code === "42P01"));
}

/** The stored key, or null. Cached for a minute so a nightly run reads it once. */
export async function getOpenAiKey(): Promise<string | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  const service = createServiceClient();
  if (!service) {
    return null;
  }

  const { data, error } = await service.from("app_secrets").select("value").eq("key", KEY).maybeSingle();
  if (error) {
    console.error("Failed to read OpenAI key:", error.message);
    return null;
  }

  cached = { value: (data as { value: string } | null)?.value ?? null, at: Date.now() };
  return cached.value;
}

export async function requireOpenAiKey() {
  const key = await getOpenAiKey();
  if (!key) {
    throw new OpenAiKeyMissingError();
  }
  return key;
}

export type OpenAiKeyStatus =
  | { state: "ready"; masked: string; updatedAt: string }
  | { state: "missing" }
  | { state: "no-table" }
  | { state: "no-service" };

export async function getOpenAiKeyStatus(): Promise<OpenAiKeyStatus> {
  const service = createServiceClient();
  if (!service) {
    return { state: "no-service" };
  }

  const { data, error } = await service
    .from("app_secrets")
    .select("value, updated_at")
    .eq("key", KEY)
    .maybeSingle();

  if (isMissingTable(error)) {
    return { state: "no-table" };
  }
  if (error || !data) {
    return { state: "missing" };
  }

  const row = data as { value: string; updated_at: string };
  return { state: "ready", masked: `sk-…${row.value.slice(-4)}`, updatedAt: row.updated_at };
}

/** Ask OpenAI whether the key works, without spending credit. */
export async function verifyOpenAiKey(key: string): Promise<"ok" | "invalid" | "unreachable"> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (response.ok) {
      return "ok";
    }
    return response.status === 401 || response.status === 403 ? "invalid" : "unreachable";
  } catch {
    return "unreachable";
  }
}

export async function saveOpenAiKey(key: string, userId: string | null) {
  const service = createServiceClient();
  if (!service) {
    return "no-service" as const;
  }

  const { error } = await service.from("app_secrets").upsert({
    key: KEY,
    value: key,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  });

  if (isMissingTable(error)) {
    return "no-table" as const;
  }
  if (error) {
    console.error("Failed to save OpenAI key:", error.message);
    return "failed" as const;
  }

  cached = null;
  return "saved" as const;
}

export async function clearOpenAiKey() {
  const service = createServiceClient();
  if (!service) {
    return;
  }
  const { error } = await service.from("app_secrets").delete().eq("key", KEY);
  if (error && !isMissingTable(error)) {
    console.error("Failed to remove OpenAI key:", error.message);
  }
  cached = null;
}

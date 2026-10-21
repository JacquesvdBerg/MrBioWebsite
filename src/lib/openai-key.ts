import "server-only";
import { deleteSecret, readSecret, readSecretRow, writeSecret } from "@/lib/app-secrets";

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

/** The stored key, or null. Cached for a minute so a nightly run reads it once. */
export async function getOpenAiKey(): Promise<string | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  cached = { value: await readSecret(KEY), at: Date.now() };
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
  const row = await readSecretRow(KEY);
  if (row.state !== "ready") {
    return row;
  }
  return { state: "ready", masked: `sk-…${row.value.slice(-4)}`, updatedAt: row.updatedAt };
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
  const result = await writeSecret(KEY, key, userId);
  if (result === "saved") {
    cached = null;
  }
  return result;
}

export async function clearOpenAiKey() {
  await deleteSecret(KEY);
  cached = null;
}

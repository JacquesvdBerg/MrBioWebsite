import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

// Private values (API keys, notification settings) live in public.app_secrets.
// Only the service role can read or write that table; nothing reaches the browser.

export type SecretRow =
  | { state: "ready"; value: string; updatedAt: string }
  | { state: "missing" }
  | { state: "no-table" }
  | { state: "no-service" };

export type SecretWriteResult = "saved" | "no-table" | "failed" | "no-service";

function isMissingTable(error: { code?: string; message?: string } | null) {
  return Boolean(error && (error.code === "PGRST205" || error.code === "42P01"));
}

export async function readSecretRow(key: string): Promise<SecretRow> {
  const service = createServiceClient();
  if (!service) {
    return { state: "no-service" };
  }

  const { data, error } = await service
    .from("app_secrets")
    .select("value, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (isMissingTable(error)) {
    return { state: "no-table" };
  }
  if (error) {
    console.error(`Failed to read ${key}:`, error.message);
    return { state: "missing" };
  }
  if (!data) {
    return { state: "missing" };
  }

  const row = data as { value: string; updated_at: string };
  return { state: "ready", value: row.value, updatedAt: row.updated_at };
}

export async function readSecret(key: string) {
  const row = await readSecretRow(key);
  return row.state === "ready" ? row.value : null;
}

export async function writeSecret(key: string, value: string, userId: string | null): Promise<SecretWriteResult> {
  const service = createServiceClient();
  if (!service) {
    return "no-service";
  }

  const { error } = await service.from("app_secrets").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  });

  if (isMissingTable(error)) {
    return "no-table";
  }
  if (error) {
    console.error(`Failed to save ${key}:`, error.message);
    return "failed";
  }
  return "saved";
}

export async function deleteSecret(key: string) {
  const service = createServiceClient();
  if (!service) {
    return;
  }
  const { error } = await service.from("app_secrets").delete().eq("key", key);
  if (error && !isMissingTable(error)) {
    console.error(`Failed to remove ${key}:`, error.message);
  }
}

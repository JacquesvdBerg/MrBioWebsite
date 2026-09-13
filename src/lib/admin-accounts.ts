import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type AdminAccount = {
  id: string;
  email: string;
  createdAt: string;
};

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const service = createServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("profiles")
    .select("id, email, created_at, kind")
    .eq("kind", "admin")
    .order("email");

  if (error) {
    console.error("Kon nie admin-rekeninge lees nie:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    email: String(row.email ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export function isServiceRoleConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  return Boolean(url && key);
}

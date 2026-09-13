import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Purchase = {
  id: string;
  title: string;
  status: "pending" | "paid" | "refunded";
  createdAt: string;
};

export async function getPurchasesForUser(userId: string): Promise<Purchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("id, product_title, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load purchases:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: String(row.product_title ?? ""),
    status: row.status === "pending" || row.status === "refunded" ? row.status : "paid",
    createdAt: String(row.created_at),
  }));
}

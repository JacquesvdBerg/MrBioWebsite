import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const enquiryReasons = [
  "Algemene navraag",
  "Winkel / produk",
  "Skool of klasgebruik",
  "Fout op die werf",
  "Media",
] as const;

export type EnquiryReason = (typeof enquiryReasons)[number];

export const enquiryStatuses = ["new", "in_progress", "done"] as const;

export type EnquiryStatus = (typeof enquiryStatuses)[number];

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  reason: string;
  productSlug: string | null;
  grade: number | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  reason: string;
  product_slug: string | null;
  grade: number | null;
  message: string;
  status: string;
  created_at: string;
};

const columns = "id, name, email, reason, product_slug, grade, message, status, created_at";

export function isEnquiryReason(value: string): value is EnquiryReason {
  return enquiryReasons.some((reason) => reason === value);
}

export function toEnquiryStatus(value: string): EnquiryStatus {
  return enquiryStatuses.find((status) => status === value) ?? "new";
}

function toEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    reason: row.reason,
    productSlug: row.product_slug,
    grade: row.grade,
    message: row.message,
    status: toEnquiryStatus(row.status),
    createdAt: row.created_at,
  };
}

export function enquiryStatusLabel(status: EnquiryStatus) {
  switch (status) {
    case "new":
      return "Nuut";
    case "in_progress":
      return "In behandeling";
    case "done":
      return "Klaar";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function enquiryStatusTone(status: EnquiryStatus) {
  switch (status) {
    case "new":
      return "wait" as const;
    case "in_progress":
      return "draft" as const;
    case "done":
      return "live" as const;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export async function getAllEnquiries(): Promise<Enquiry[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(columns)
    .order("created_at", { ascending: false })
    .returns<EnquiryRow[]>();

  if (error) {
    console.error("Failed to load enquiries:", error.message);
    return [];
  }

  return data.map(toEnquiry);
}

export async function countEnquiriesByStatus(status: EnquiryStatus) {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    console.error("Failed to count enquiries:", error.message);
    return 0;
  }

  return count ?? 0;
}
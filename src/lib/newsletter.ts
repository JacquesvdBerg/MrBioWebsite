import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  createdAt: string;
};

const emailPattern = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

export function isNewsletterEmail(value: string) {
  return emailPattern.test(value) && value.length <= 200;
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list newsletter subscribers:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    email: String(row.email),
    createdAt: String(row.created_at),
  }));
}

export async function addNewsletterSubscriber(email: string): Promise<"saved" | "exists" | "failed"> {
  const service = createServiceClient();
  if (!service) {
    return "failed";
  }

  const { error } = await service.from("newsletter_subscribers").insert({ email });
  if (!error) {
    return "saved";
  }
  if (error.code === "23505") {
    return "exists";
  }
  console.error("Failed to save newsletter subscriber:", error.message);
  return "failed";
}

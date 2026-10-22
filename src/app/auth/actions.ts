"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { confirmLink, isLinkType, sendConfirmEmail, sendResetEmail } from "@/lib/auth-links";
import { safeNextPath } from "@/lib/safe-next";
import { contactEmail, isGrade } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type AuthResult =
  | { status: "error"; message: string }
  | { status: "check-email"; message: string }
  | { status: "signed-in"; next: string };

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const unavailable: AuthResult = {
  status: "error",
  message: "Rekeninge werk nie op die oomblik nie. Probeer later weer.",
};

async function signInNow(email: string, password: string, next: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: "error", message: "Jou rekening is gereed. Teken nou in met jou wagwoord." };
  }
  revalidatePath("/", "layout");
  return { status: "signed-in", next };
}

/** Email a confirm link, or confirm on the spot when Resend can't reach the learner yet. */
async function confirmOrLetIn(
  service: SupabaseClient,
  link: { userId: string; tokenHash: string; type: string },
  account: { email: string; name: string; password: string; next: string },
): Promise<AuthResult> {
  const url = await confirmLink(link.tokenHash, link.type, account.next);
  const sent = await sendConfirmEmail(account.email, account.name, url);

  if (sent === "sent") {
    return {
      status: "check-email",
      message: `Ons het ’n skakel na ${account.email} gestuur. Maak dit oop om jou rekening te bevestig. Kyk ook in die spam-gids.`,
    };
  }

  // Without a verified sending domain Resend only delivers to its owner, so
  // learners would never get the link. Confirm them now rather than lock them out.
  console.warn("Confirm email not sent, confirming the account directly:", sent);
  const { error } = await service.auth.admin.updateUserById(link.userId, { email_confirm: true });
  if (error) {
    console.error("Failed to confirm learner:", error.message);
    return { status: "error", message: "Kon nie die rekening klaarmaak nie. Probeer weer." };
  }
  return signInNow(account.email, account.password, account.next);
}

/** A fresh link for an account that was never confirmed. */
async function confirmAgain(
  service: SupabaseClient,
  account: { email: string; name: string; password: string; next: string },
): Promise<AuthResult> {
  const { data, error } = await service.auth.admin.generateLink({ type: "recovery", email: account.email });
  if (error || !data?.user) {
    console.error("Failed to make a confirm link:", error?.message);
    return { status: "error", message: "Kon nie ’n nuwe skakel maak nie. Probeer weer." };
  }

  return confirmOrLetIn(
    service,
    { userId: data.user.id, tokenHash: data.properties.hashed_token, type: data.properties.verification_type },
    { ...account, name: account.name || String(data.user.user_metadata?.display_name ?? "") },
  );
}

export async function registerLearner(input: {
  name: string;
  grade: string;
  email: string;
  password: string;
  next: string;
  website?: string;
}): Promise<AuthResult> {
  const name = input.name.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();
  const next = safeNextPath(input.next, "/rekening");
  const grade = Number(input.grade);

  // Bots fill the hidden field. Pretend it worked and do nothing.
  if (input.website) {
    return { status: "check-email", message: "Kyk in jou e-pos vir die skakel." };
  }
  if (!name || !emailPattern.test(email)) {
    return { status: "error", message: "Vul jou naam en ’n geldige e-posadres in." };
  }
  if (input.password.length < 8) {
    return { status: "error", message: "Wagwoord moet minstens 8 karakters wees." };
  }

  const service = createServiceClient();
  if (!service) {
    return unavailable;
  }

  const account = { email, name, password: input.password, next };
  const { data, error } = await service.auth.admin.generateLink({
    type: "signup",
    email,
    password: input.password,
    options: { data: { display_name: name, grade: isGrade(grade) ? String(grade) : "" } },
  });

  if (error || !data?.user) {
    const message = error?.message.toLowerCase() ?? "";
    if (error?.code === "email_exists" || message.includes("already")) {
      return existingAccount(service, account);
    }
    if (message.includes("password")) {
      return { status: "error", message: "Kies ’n sterker wagwoord: minstens 8 karakters, met letters en syfers." };
    }
    console.error("Failed to create learner:", error?.message);
    return { status: "error", message: "Kon nie die rekening skep nie. Probeer weer." };
  }

  return confirmOrLetIn(
    service,
    { userId: data.user.id, tokenHash: data.properties.hashed_token, type: data.properties.verification_type },
    account,
  );
}

async function existingAccount(
  service: SupabaseClient,
  account: { email: string; name: string; password: string; next: string },
): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });

  if (!error) {
    revalidatePath("/", "layout");
    return { status: "signed-in", next: account.next };
  }
  if (error.message.toLowerCase().includes("not confirmed")) {
    return confirmAgain(service, account);
  }
  return {
    status: "error",
    message: "Hierdie e-pos het al ’n rekening. Teken in, of klik “Vergeet?” vir ’n nuwe wagwoord.",
  };
}

/** From the sign-in form when Supabase says the email is not confirmed yet. */
export async function resendConfirmation(input: { email: string; password: string; next: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return { status: "error", message: "Vul ’n geldige e-posadres in." };
  }

  const service = createServiceClient();
  if (!service) {
    return unavailable;
  }

  return confirmAgain(service, { email, name: "", password: input.password, next: safeNextPath(input.next, "/rekening") });
}

export async function requestPasswordReset(input: { email: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return { status: "error", message: "Vul ’n geldige e-posadres in." };
  }

  const service = createServiceClient();
  if (!service) {
    return unavailable;
  }

  const checkEmail: AuthResult = {
    status: "check-email",
    message: "As daardie e-pos ’n rekening het, is ’n skakel op pad. Kyk ook in die spam-gids.",
  };

  const { data, error } = await service.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data?.properties) {
    // Unknown address: say the same thing, so nobody can test which emails have accounts.
    return checkEmail;
  }

  const url = await confirmLink(data.properties.hashed_token, data.properties.verification_type, "/auth/update-password");
  const sent = await sendResetEmail(email, url);
  if (sent === "sent") {
    return checkEmail;
  }

  console.error("Reset email not sent:", sent);
  return {
    status: "error",
    message: `Ons kan nie nou ’n e-pos stuur nie. Stuur ’n e-pos aan ${contactEmail}, dan help die onderwyser jou.`,
  };
}

/** The button on /auth/confirm. Verifying here, not on page load, keeps mail scanners from using up the link. */
export async function confirmEmailLink(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/rekening");

  if (!tokenHash || !isLinkType(type)) {
    redirect("/auth/confirm?fout=1");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    console.error("Failed to verify email link:", error.message);
    redirect("/auth/confirm?fout=1");
  }

  revalidatePath("/", "layout");
  redirect(next);
}

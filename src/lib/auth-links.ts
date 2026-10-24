import "server-only";
import { headers } from "next/headers";
import { defaultSender, domainSender, getEmailSettings, getResendKey, sendEmail, type SendResult } from "@/lib/email";
import { siteName, siteUrl } from "@/lib/site";

// Sign-up and password emails go out through Resend instead of Supabase's
// mailer (which allows only a couple of emails an hour). The links carry a
// token_hash that /auth/confirm checks with verifyOtp after a button press, so
// they work in any browser or mail app (no PKCE verifier) and a mail scanner
// that opens the link cannot use up the token.

export const linkTypes = ["signup", "recovery", "magiclink", "invite", "email"] as const;

export type LinkType = (typeof linkTypes)[number];

export function isLinkType(value: string): value is LinkType {
  return (linkTypes as readonly string[]).includes(value);
}

/** Links point at the public address, except in local development. */
async function linkOrigin() {
  if (process.env.NODE_ENV !== "development") {
    return siteUrl;
  }
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host");
  return host ? `${head.get("x-forwarded-proto") ?? "http"}://${host}` : siteUrl;
}

export async function confirmLink(tokenHash: string, type: string, next: string) {
  const params = new URLSearchParams({ token_hash: tokenHash, type, next });
  return `${await linkOrigin()}/auth/confirm?${params.toString()}`;
}

async function sendAuthEmail(to: string, content: Parameters<typeof sendEmail>[1]["content"]): Promise<SendResult> {
  const [key, settings] = await Promise.all([getResendKey(), getEmailSettings()]);
  // A saved Van-adres on the real domain wins. The shared test sender cannot
  // deliver a reset or confirm link to a learner.
  const from = settings.from === defaultSender || settings.from.includes("@resend.dev") ? domainSender : settings.from;
  return sendEmail(key, { to, from, replyTo: settings.to, content });
}

export function sendConfirmEmail(to: string, name: string, link: string) {
  return sendAuthEmail(to, {
    subject: `Bevestig jou ${siteName}-rekening`,
    heading: name ? `Welkom, ${name}` : "Welkom",
    intro:
      "Klik op die knoppie om jou e-posadres te bevestig. Dan is jou rekening gereed en kan jy die onderwyser vrae vra.",
    action: { label: "Bevestig my e-pos", href: link },
    footnote: `Die skakel werk net een keer. Het jy nie vir ${siteName} ingeskryf nie? Ignoreer dan hierdie e-pos.`,
  });
}

export function sendResetEmail(to: string, link: string) {
  return sendAuthEmail(to, {
    subject: `Kies ’n nuwe ${siteName}-wagwoord`,
    heading: "Nuwe wagwoord",
    intro: "Iemand het gevra om die wagwoord vir hierdie e-posadres te herstel. Klik op die knoppie om ’n nuwe een te kies.",
    action: { label: "Kies ’n nuwe wagwoord", href: link },
    footnote: "Het jy nie gevra nie? Ignoreer dan hierdie e-pos. Jou wagwoord bly dieselfde.",
  });
}

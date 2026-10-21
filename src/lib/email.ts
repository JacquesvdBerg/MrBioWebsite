import "server-only";
import { deleteSecret, readSecret, readSecretRow, writeSecret } from "@/lib/app-secrets";
import { contactEmail, siteName, siteUrl } from "@/lib/site";

// Email goes out through the teacher's own Resend account. The key and the
// notification choices live in app_secrets and are set under Admin > Instellings.

const KEY = "resend_api_key";
const SETTINGS_KEY = "email_settings";

/** Resend's shared test sender. It can only deliver to the Resend account's own address. */
export const defaultSender = `${siteName} <onboarding@resend.dev>`;

export const notifyKinds = ["enquiries", "chat", "comments"] as const;

export type NotifyKind = (typeof notifyKinds)[number];

export type EmailSettings = { to: string; from: string } & Record<NotifyKind, boolean>;

const defaults: EmailSettings = {
  to: contactEmail,
  from: defaultSender,
  enquiries: true,
  chat: true,
  comments: true,
};

export async function getEmailSettings(): Promise<EmailSettings> {
  const raw = await readSecret(SETTINGS_KEY);
  if (!raw) {
    return defaults;
  }

  try {
    const value = JSON.parse(raw) as Partial<EmailSettings>;
    return {
      to: typeof value.to === "string" && value.to ? value.to : defaults.to,
      from: typeof value.from === "string" && value.from ? value.from : defaults.from,
      enquiries: value.enquiries !== false,
      chat: value.chat !== false,
      comments: value.comments !== false,
    };
  } catch {
    return defaults;
  }
}

export function saveEmailSettings(settings: EmailSettings, userId: string | null) {
  return writeSecret(SETTINGS_KEY, JSON.stringify(settings), userId);
}

export type ResendKeyStatus =
  | { state: "ready"; masked: string; updatedAt: string }
  | { state: "missing" }
  | { state: "no-table" }
  | { state: "no-service" };

export async function getResendKeyStatus(): Promise<ResendKeyStatus> {
  const row = await readSecretRow(KEY);
  if (row.state !== "ready") {
    return row;
  }
  return { state: "ready", masked: `re_…${row.value.slice(-4)}`, updatedAt: row.updatedAt };
}

export function getResendKey() {
  return readSecret(KEY);
}

export function saveResendKey(key: string, userId: string | null) {
  return writeSecret(KEY, key, userId);
}

export function clearResendKey() {
  return deleteSecret(KEY);
}

export type EmailContent = {
  subject: string;
  heading: string;
  intro: string;
  /** Label and value pairs, shown as a small table. */
  rows?: ReadonlyArray<readonly [string, string]>;
  /** The visitor's own words, shown as a quote. */
  quote?: string;
  action?: { label: string; href: string };
  footnote?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function multiline(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

export function renderEmail(content: EmailContent) {
  const rows = content.rows?.filter(([, value]) => value) ?? [];
  const rowHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5b6b7a;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0e2233;font-weight:600">${multiline(value)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="af">
<body style="margin:0;padding:0;background:#eef3f6;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f6;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#10283f;padding:18px 24px;color:#ffffff;font-size:20px;font-weight:800">${siteName}<span style="color:#7fd38f;font-weight:600;font-size:14px;padding-left:8px">${escapeHtml("Lewenswetenskappe")}</span></td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#0e2233">${escapeHtml(content.heading)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#33475b">${multiline(content.intro)}</p>
${rowHtml ? `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;margin:0 0 16px">${rowHtml}</table>` : ""}
${content.quote ? `<div style="margin:0 0 18px;padding:14px 16px;border-left:4px solid #2fa34a;background:#f3f8f4;border-radius:8px;font-size:15px;line-height:1.6;color:#0e2233">${multiline(content.quote)}</div>` : ""}
${content.action ? `<a href="${escapeHtml(content.action.href)}" style="display:inline-block;background:#2fa34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 20px;border-radius:999px">${escapeHtml(content.action.label)}</a>` : ""}
${content.footnote ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#5b6b7a">${multiline(content.footnote)}</p>` : ""}
</td></tr>
</table>
<p style="margin:14px 0 0;font-size:12px;color:#7a8a99">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</p>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    content.heading,
    "",
    content.intro,
    ...(rows.length ? ["", ...rows.map(([label, value]) => `${label}: ${value}`)] : []),
    ...(content.quote ? ["", content.quote] : []),
    ...(content.action ? ["", `${content.action.label}: ${content.action.href}`] : []),
    ...(content.footnote ? ["", content.footnote] : []),
  ].join("\n");

  return { html, text };
}

export type SendResult = "sent" | "no-key" | "invalid" | "own-only" | "from-domain" | "limit" | "failed";

async function refusal(response: Response): Promise<SendResult> {
  const body = (await response.json().catch(() => null)) as { name?: string; message?: string } | null;
  const message = (body?.message ?? "").toLowerCase();

  if (response.status === 429) {
    return "limit";
  }
  if (message.includes("own email")) {
    return "own-only";
  }
  if (message.includes("not verified") || body?.name === "invalid_from_address") {
    return "from-domain";
  }
  if (response.status === 401 || response.status === 403 || message.includes("api key")) {
    return "invalid";
  }

  console.error("Resend refused the email:", response.status, body?.name, body?.message);
  return "failed";
}

export async function sendEmail(
  key: string | null,
  mail: { to: string; from?: string; replyTo?: string; content: EmailContent },
): Promise<SendResult> {
  if (!key) {
    return "no-key";
  }

  const { html, text } = renderEmail(mail.content);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mail.from || defaultSender,
        to: [mail.to],
        subject: mail.content.subject,
        html,
        text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    return response.ok ? "sent" : await refusal(response);
  } catch (error) {
    console.error("Could not reach Resend:", error instanceof Error ? error.message : error);
    return "failed";
  }
}

/** Email the teacher about something new, if that kind of notice is switched on. */
export async function notifyTeacher(kind: NotifyKind, content: EmailContent, replyTo?: string) {
  const [key, settings] = await Promise.all([getResendKey(), getEmailSettings()]);
  if (!key || !settings[kind]) {
    return;
  }

  const result = await sendEmail(key, { to: settings.to, from: settings.from, replyTo, content });
  if (result !== "sent") {
    console.error(`Email notice (${kind}) was not sent:`, result);
  }
}

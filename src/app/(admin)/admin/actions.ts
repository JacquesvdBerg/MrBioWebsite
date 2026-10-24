"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mediaBucket } from "@/lib/media-bucket";
import { requireAdmin } from "@/lib/require-admin";
import { parseQuizPayload } from "@/lib/quiz";
import { grades, isActivitySlug, isGrade, siteUrl } from "@/lib/site";
import { parseTrueOrFalsePayload } from "@/lib/true-or-false";
import { slugify } from "@/lib/slug";
import { getAiSettings, saveAiSettings } from "@/lib/ai-settings";
import { getSessionAccount } from "@/lib/auth-role";
import { clearOpenAiKey, saveOpenAiKey, verifyOpenAiKey } from "@/lib/openai-key";
import {
  clearResendKey,
  defaultSender,
  getEmailSettings,
  getResendKey,
  saveEmailSettings,
  saveResendKey,
} from "@/lib/email";
import { confirmLink, isLinkType, sendResetEmail } from "@/lib/auth-links";
import { sendTestEmail, sendWelcomeEmail } from "@/lib/notifications";
import { toCommentStatus } from "@/lib/comments";
import { closePasswordHelp, findAccountByEmail, isPlainEmail } from "@/lib/password-help";
import { toEnquiryStatus } from "@/lib/enquiries";
import { parseBulletLines } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { defaultThemePage, themePageFromForm } from "@/lib/theme-page";
import { themePath } from "@/lib/themes";
import { weeklyFactStatuses, type WeeklyFactStatus } from "@/lib/weekly-facts";
import { bioArtKinds, visualTones } from "@/lib/visual-tone";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const name = String(formData.get("name") ?? "");

  if (!name) {
    return;
  }

  await supabase.storage.from(mediaBucket).remove([name]);
  revalidatePath("/admin/media");
  revalidatePath("/admin/themes");
}

export async function upsertTheme(formData: FormData) {
  const supabase = await requireAdmin();
  const existingSlug = String(formData.get("existingSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = existingSlug || slugify(String(formData.get("slug") || title));
  const blurb = String(formData.get("blurb") ?? "").trim();
  const tone = String(formData.get("tone") ?? "green");
  const imagePath = String(formData.get("image_path") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isPublished = formData.get("is_published") === "on";

  if (!title || !slug) {
    return;
  }

  const payload: Record<string, unknown> = {
    slug,
    title,
    blurb,
    href: themePath(slug),
    tone,
    image_path: imagePath,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_published: isPublished,
  };

  if (!existingSlug) {
    payload.page = defaultThemePage({ title, blurb });
  }

  const { error } = await supabase.from("themes").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    console.error("Kon nie tema stoor nie:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath(themePath(slug));
  revalidatePath("/admin/themes");
  revalidatePath(`/admin/themes/${slug}`);

  if (!existingSlug) {
    redirect(`/admin/themes/${slug}`);
  }
}

export async function saveThemePage(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = String(formData.get("existingSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  const tone = String(formData.get("tone") ?? "green");
  const imagePath = String(formData.get("image_path") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isPublished = formData.get("is_published") === "on";

  if (!slug || !title) {
    return;
  }

  const { error } = await supabase
    .from("themes")
    .update({
      title,
      blurb,
      tone,
      image_path: imagePath,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_published: isPublished,
      href: themePath(slug),
      page: themePageFromForm(formData, { title, blurb }),
    })
    .eq("slug", slug);

  if (error) {
    console.error("Kon nie temabladsy stoor nie:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath(themePath(slug));
  revalidatePath("/admin/themes");
  revalidatePath(`/admin/themes/${slug}`);
}

export async function deleteTheme(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");

  if (!slug) {
    return;
  }

  await supabase.from("themes").delete().eq("slug", slug);
  revalidatePath("/");
  revalidatePath(themePath(slug));
  revalidatePath("/admin/themes");
}

export async function createVideo(formData: FormData) {
  const supabase = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();

  if (!title || !youtubeUrl) {
    return;
  }

  const { error } = await supabase.from("videos").insert({
    title,
    youtube_url: youtubeUrl,
    grade: Number(formData.get("grade")) || null,
    topic: String(formData.get("topic") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    thumbnail_path: String(formData.get("thumbnail_path") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    is_published: formData.get("is_published") === "on",
  });

  if (error) {
    console.error("Kon nie video stoor nie:", error.message);
    return;
  }

  revalidatePath("/video-lessons");
  revalidatePath("/admin/videos");
}

export async function deleteVideo(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/video-lessons");
  revalidatePath("/admin/videos");
}

export async function saveQuiz(formData: FormData) {
  const supabase = await requireAdmin();
  const existingSlug = String(formData.get("existingSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = existingSlug || slugify(String(formData.get("slug") || title));
  const description = String(formData.get("description") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const themeSlug = String(formData.get("theme_slug") ?? "").trim() || null;
  const grade = Number(formData.get("grade")) || null;
  const isPublished = formData.get("is_published") === "on";

  let parsedPayload: unknown = {};
  try {
    parsedPayload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return;
  }

  const quiz = parseQuizPayload(parsedPayload);

  if (!title || !slug || quiz.questions.length === 0) {
    return;
  }

  const row = {
    kind: "quiz" as const,
    slug,
    title,
    description,
    grade,
    topic,
    theme_slug: themeSlug,
    payload: quiz,
    is_published: isPublished,
  };

  const { error } = existingSlug
    ? await supabase.from("activities").update(row).eq("slug", existingSlug)
    : await supabase.from("activities").insert(row);

  if (error) {
    console.error("Kon nie vasvra stoor nie:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/play-and-learn");
  if (grade) {
    revalidatePath(`/play-and-learn/graad/${grade}`);
    revalidatePath(`/play-and-learn/graad/${grade}/quiz`);
  }
  revalidatePath("/play-and-learn/quiz");
  revalidatePath(`/play-and-learn/quiz/${slug}`);
  revalidatePath("/admin/activities");
  redirect(`/admin/activities/quiz/${slug}`);
}

export async function saveTrueOrFalse(formData: FormData) {
  const supabase = await requireAdmin();
  const existingSlug = String(formData.get("existingSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = existingSlug || slugify(String(formData.get("slug") || title));
  const description = String(formData.get("description") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const themeSlug = String(formData.get("theme_slug") ?? "").trim() || null;
  const grade = Number(formData.get("grade")) || null;
  const isPublished = formData.get("is_published") === "on";

  let parsedPayload: unknown = {};
  try {
    parsedPayload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return;
  }

  const quiz = parseTrueOrFalsePayload(parsedPayload);

  if (!title || !slug || quiz.questions.length === 0) {
    return;
  }

  const row = {
    kind: "true-or-false" as const,
    slug,
    title,
    description,
    grade,
    topic,
    theme_slug: themeSlug,
    payload: quiz,
    is_published: isPublished,
  };

  const { error } = existingSlug
    ? await supabase.from("activities").update(row).eq("slug", existingSlug)
    : await supabase.from("activities").insert(row);

  if (error) {
    console.error("Failed to save true or false:", error.message);
    return;
  }

  revalidatePath("/");
  revalidatePath("/play-and-learn");
  if (grade) {
    revalidatePath(`/play-and-learn/graad/${grade}`);
    revalidatePath(`/play-and-learn/graad/${grade}/true-or-false`);
  }
  revalidatePath("/play-and-learn/true-or-false");
  revalidatePath(`/play-and-learn/true-or-false/${slug}`);
  revalidatePath("/admin/activities");
  redirect(`/admin/activities/true-or-false/${slug}`);
}

export async function deleteActivity(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const kind = String(formData.get("kind") ?? "");

  if (!slug) {
    return;
  }

  await supabase.from("activities").delete().eq("slug", slug);
  revalidatePath("/play-and-learn");
  for (const grade of grades) {
    revalidatePath(`/play-and-learn/graad/${grade}`);
    if (isActivitySlug(kind)) {
      revalidatePath(`/play-and-learn/graad/${grade}/${kind}`);
    }
  }
  if (kind) {
    revalidatePath(`/play-and-learn/${kind}`);
  }
  revalidatePath("/admin/activities");
}

export async function saveAiSettingsAction(formData: FormData) {
  await requireAdmin();
  const current = await getAiSettings();
  const difficulty = String(formData.get("difficulty") ?? "hersiening");

  await saveAiSettings({
    ...current,
    houseRules: String(formData.get("houseRules") ?? "").trim(),
    paused: formData.get("paused") === "on",
    difficulty:
      difficulty === "eksamen" || difficulty === "uitdaging"
        ? difficulty
        : "hersiening",
  });

  revalidatePath("/admin/settings");
}

export async function saveOpenAiKeyAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("openai_key") ?? "").trim();

  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) {
    redirect("/admin/settings?ai=format#ai-sleutel");
  }

  const check = await verifyOpenAiKey(key);
  if (check !== "ok") {
    redirect(`/admin/settings?ai=${check}#ai-sleutel`);
  }

  const account = await getSessionAccount();
  const result = await saveOpenAiKey(key, account?.userId ?? null);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  redirect(`/admin/settings?ai=${result}#ai-sleutel`);
}

export async function removeOpenAiKeyAction() {
  await requireAdmin();
  await clearOpenAiKey();
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  redirect("/admin/settings?ai=removed#ai-sleutel");
}

function emailResult(result: string): never {
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  redirect(`/admin/settings?epos=${result}#e-pos`);
}

export async function saveResendKeyAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("resend_key") ?? "").trim();

  if (!/^re_[A-Za-z0-9_]{16,}$/.test(key)) {
    emailResult("format");
  }

  // Sending the test email is the check: it proves the key works and that mail arrives.
  const check = await sendTestEmail(key, await getEmailSettings());
  if (check !== "sent" && check !== "own-only" && check !== "from-domain") {
    emailResult(check);
  }

  const account = await getSessionAccount();
  const saved = await saveResendKey(key, account?.userId ?? null);
  if (saved !== "saved") {
    emailResult(saved);
  }
  // A key that works but can't reach the address yet is still kept; the notice explains the fix.
  emailResult(check === "sent" ? "saved" : check);
}

export async function removeResendKeyAction() {
  await requireAdmin();
  await clearResendKey();
  emailResult("removed");
}

const emailAddress = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export async function saveEmailSettingsAction(formData: FormData) {
  await requireAdmin();
  const to = String(formData.get("to") ?? "").trim();
  const from = String(formData.get("from") ?? "").trim() || defaultSender;
  const fromAddress = from.match(/<([^<>]+)>$/)?.[1] ?? from;

  if (!emailAddress.test(to)) {
    emailResult("to");
  }
  if (!emailAddress.test(fromAddress)) {
    emailResult("from");
  }

  const account = await getSessionAccount();
  const saved = await saveEmailSettings(
    {
      to,
      from,
      enquiries: formData.get("enquiries") === "on",
      chat: formData.get("chat") === "on",
      comments: formData.get("comments") === "on",
    },
    account?.userId ?? null,
  );
  emailResult(saved === "saved" ? "settings" : saved);
}

export async function sendTestEmailAction() {
  await requireAdmin();
  const result = await sendTestEmail((await getResendKey()) ?? "", await getEmailSettings());
  emailResult(result === "sent" ? "test" : result);
}

export async function addAiTerm(formData: FormData) {
  await requireAdmin();
  const use = String(formData.get("use") ?? "").trim();
  const never = String(formData.get("never") ?? "").trim();
  const exam = String(formData.get("exam") ?? "").trim();

  if (!use || !never) {
    return;
  }

  const current = await getAiSettings();
  const already = current.terms.some(
    (term) => term.use.toLowerCase() === use.toLowerCase() && term.never.toLowerCase() === never.toLowerCase(),
  );

  if (already) {
    return;
  }

  await saveAiSettings({
    ...current,
    terms: [...current.terms, { id: crypto.randomUUID(), use, never, exam }],
  });

  revalidatePath("/admin/settings");
}

export async function deleteAiTerm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const current = await getAiSettings();
  await saveAiSettings({
    ...current,
    terms: current.terms.filter((term) => term.id !== id),
  });

  revalidatePath("/admin/settings");
}

export async function createTopic(formData: FormData) {
  const supabase = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const grade = Number(formData.get("grade"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !isGrade(grade)) {
    return;
  }

  await supabase.from("activity_topics").insert({
    title,
    grade,
    notes,
    is_active: true,
  });

  revalidatePath("/admin/topics");
}

export async function deleteTopic(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await supabase.from("activity_topics").delete().eq("id", id);
  revalidatePath("/admin/topics");
}

export async function toggleTopic(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!id) {
    return;
  }

  await supabase
    .from("activity_topics")
    .update({ is_active: !isActive })
    .eq("id", id);
  revalidatePath("/admin/topics");
}

function accountCreateError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered")) {
    return "exists";
  }
  if (lower.includes("password")) {
    return "password";
  }
  return "failed";
}

function passwordHelpRedirect(error: string, email: string): never {
  const params = new URLSearchParams({ error, email });
  redirect(`/admin/accounts?${params.toString()}#wagwoord`);
}

type PasswordChange =
  | { ok: true; id: string; email: string }
  | { ok: false; code: "email" | "password" | "service" | "admin-password" | "learner" | "weak" | "failed" };

function generatedPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const alphabet = letters + digits;
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = [...bytes].map((byte, index) => {
    if (index === 0) return letters[byte % letters.length];
    if (index === 1) return digits[byte % digits.length];
    return alphabet[byte % alphabet.length];
  });
  return chars.join("");
}

async function changeLearnerPassword(email: string, password: string): Promise<PasswordChange> {
  await requireAdmin();
  const normalized = email.trim().toLowerCase();
  if (!isPlainEmail(normalized)) {
    return { ok: false, code: "email" };
  }
  if (password.length < 8) {
    return { ok: false, code: "password" };
  }

  const service = createServiceClient();
  if (!service) {
    return { ok: false, code: "service" };
  }

  const account = await findAccountByEmail(normalized);
  switch (account.status) {
    case "found":
      break;
    case "admin":
      return { ok: false, code: "admin-password" };
    case "missing":
      return { ok: false, code: "learner" };
    case "no-service":
      return { ok: false, code: "service" };
    case "error":
      return { ok: false, code: "failed" };
    default: {
      const exhaustive: never = account;
      return exhaustive;
    }
  }

  const { error } = await service.auth.admin.updateUserById(account.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to set learner password:", error.message);
    return { ok: false, code: error.message.toLowerCase().includes("password") ? "weak" : "failed" };
  }

  await closePasswordHelp(account.id, account.email);
  revalidatePath("/admin/accounts");
  return { ok: true, id: account.id, email: account.email };
}

function passwordChangeMessage(code: Exclude<PasswordChange, { ok: true }>["code"]) {
  switch (code) {
    case "email":
      return "Daardie e-posadres lyk nie reg nie.";
    case "password":
      return "Wagwoord moet minstens 8 karakters wees.";
    case "service":
      return "Die dienssleutel ontbreek, so ek kan nie die wagwoord verander nie.";
    case "admin-password":
      return "Admin-wagwoorde verander jy nie op hierdie vorm nie.";
    case "learner":
      return "Geen leerderrekening met daardie e-pos nie.";
    case "weak":
      return "Kies ’n sterker wagwoord: minstens 8 karakters, met letters en syfers.";
    case "failed":
      return "Kon nie die wagwoord verander nie. Probeer weer.";
    default: {
      const exhaustive: never = code;
      return exhaustive;
    }
  }
}

export async function setLearnerPassword(formData: FormData) {
  const email = formText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const result = await changeLearnerPassword(email, password);
  if (!result.ok) {
    passwordHelpRedirect(result.code, email);
  }

  const params = new URLSearchParams({ saved: "1", email: result.email });
  redirect(`/admin/accounts?${params.toString()}#wagwoord`);
}

export async function generateLearnerPassword(email: string): Promise<
  | { status: "ok"; password: string }
  | { status: "error"; message: string }
> {
  const password = generatedPassword();
  const result = await changeLearnerPassword(email, password);
  if (!result.ok) {
    return { status: "error", message: passwordChangeMessage(result.code) };
  }
  return { status: "ok", password };
}

function isOwnResetLink(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const site = new URL(siteUrl);
  const sameSite = parsed.hostname === site.hostname || parsed.hostname.endsWith(".mnrbio.co.za");
  const type = parsed.searchParams.get("type") ?? "";
  return sameSite && parsed.pathname === "/auth/confirm" && Boolean(parsed.searchParams.get("token_hash")) && isLinkType(type);
}

export async function createPasswordResetLink(email: string): Promise<
  | { status: "ok"; url: string }
  | { status: "error"; message: string }
> {
  await requireAdmin();
  const normalized = email.trim().toLowerCase();
  if (!isPlainEmail(normalized)) {
    return { status: "error", message: "Daardie e-posadres lyk nie reg nie." };
  }

  const service = createServiceClient();
  if (!service) {
    return { status: "error", message: "Die dienssleutel ontbreek, so ek kan nie ’n skakel maak nie." };
  }

  const account = await findAccountByEmail(normalized);
  switch (account.status) {
    case "found":
      break;
    case "admin":
      return { status: "error", message: "Admin-rekeninge kry nie hier ’n skakel nie." };
    case "missing":
      return { status: "error", message: "Geen leerderrekening met daardie e-pos nie." };
    case "no-service":
      return { status: "error", message: "Die dienssleutel ontbreek, so ek kan nie ’n skakel maak nie." };
    case "error":
      return { status: "error", message: "Kon nie die rekening vind nie. Probeer weer." };
    default: {
      const exhaustive: never = account;
      return exhaustive;
    }
  }

  const { data, error } = await service.auth.admin.generateLink({ type: "recovery", email: account.email });
  if (error || !data.properties?.hashed_token) {
    console.error("Failed to make a reset link:", error?.message);
    return { status: "error", message: "Kon nie ’n skakel maak nie. Probeer weer." };
  }

  const url = await confirmLink(
    data.properties.hashed_token,
    data.properties.verification_type,
    "/auth/update-password",
  );
  return { status: "ok", url };
}

export async function emailPasswordResetLink(email: string, url: string): Promise<
  | { status: "ok" }
  | { status: "error"; message: string }
> {
  await requireAdmin();
  const normalized = email.trim().toLowerCase();
  if (!isPlainEmail(normalized) || !isOwnResetLink(url)) {
    return { status: "error", message: "Die skakel is nie geldig nie. Maak ’n nuwe een." };
  }

  const account = await findAccountByEmail(normalized);
  if (account.status !== "found") {
    return { status: "error", message: "Geen leerderrekening met daardie e-pos nie." };
  }

  const sent = await sendResetEmail(account.email, url);
  if (sent !== "sent") {
    return { status: "error", message: "Die e-pos het nie uitgegaan nie. Kopieer die skakel en stuur dit self." };
  }

  await closePasswordHelp(account.id, account.email);
  revalidatePath("/admin/accounts");
  return { status: "ok" };
}

export async function createAdminAccount(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email) {
    redirect("/admin/accounts?error=email");
  }

  if (password.length < 8) {
    redirect("/admin/accounts?error=password");
  }

  const service = createServiceClient();

  if (!service) {
    redirect("/admin/accounts?error=service");
  }

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
    user_metadata: name ? { display_name: name } : undefined,
  });

  if (error || !data.user) {
    redirect(`/admin/accounts?error=${accountCreateError(error?.message ?? "")}`);
  }

  // The new-user trigger runs before Supabase attaches app_metadata, so it
  // files every new login as a learner. Mark this profile as admin here.
  const { error: profileError } = await service.from("profiles").upsert({
    id: data.user.id,
    email,
    kind: "admin",
    display_name: name || email.split("@")[0],
  });

  if (profileError) {
    console.error("Failed to mark new admin profile:", profileError.message);
  }

  const welcome = formData.get("welcome") === "on" ? await sendWelcomeEmail({ email, name }) : null;

  revalidatePath("/admin/accounts");
  redirect(`/admin/accounts?created=1${welcome ? `&welcome=${welcome}` : ""}`);
}

function optionalGrade(formData: FormData, name = "grade") {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) {
    return null;
  }

  const grade = Number(raw);
  return isGrade(grade) ? grade : null;
}

function requiredGrade(formData: FormData) {
  return optionalGrade(formData);
}

function formText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function isWeeklyFactStatus(value: string): value is WeeklyFactStatus {
  return weeklyFactStatuses.some((status) => status === value);
}

function revalidateWeeklyFacts(slug?: string) {
  revalidatePath("/weekly-facts");
  revalidatePath("/admin/weekly-facts");
  if (slug) {
    revalidatePath(`/admin/weekly-facts/${slug}`);
  }
}

function revalidateShop(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) {
    revalidatePath(`/admin/products/${slug}`);
  }
}

export async function toggleActivityPublished(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = formText(formData, "slug");
  const kind = formText(formData, "kind");
  const isPublished = formData.get("is_published") === "true";

  if (!slug) {
    return;
  }

  const { error } = await supabase
    .from("activities")
    .update({ is_published: !isPublished })
    .eq("slug", slug);

  if (error) {
    console.error("Failed to toggle activity publish state:", error.message);
    return;
  }

  revalidatePath("/play-and-learn");
  for (const grade of grades) {
    revalidatePath(`/play-and-learn/graad/${grade}`);
    if (isActivitySlug(kind)) {
      revalidatePath(`/play-and-learn/graad/${grade}/${kind}`);
    }
  }
  if (kind) {
    revalidatePath(`/play-and-learn/${kind}`);
  }
  revalidatePath("/admin/activities");
  revalidatePath("/admin");
}

export async function createWeeklyFact(formData: FormData) {
  const supabase = await requireAdmin();
  const title = formText(formData, "title");
  const slug = slugify(formText(formData, "slug") || title);
  const grade = requiredGrade(formData);

  if (!title || !slug || grade === null) {
    redirect("/admin/weekly-facts?error=fields");
  }

  const { error } = await supabase.from("weekly_facts").insert({
    slug,
    title,
    body: "",
    category: formText(formData, "category") || "Menslike liggaam",
    grade,
    week_label: formText(formData, "week_label"),
    status: "draft",
  });

  if (error) {
    console.error("Failed to create weekly fact:", error.message);
    redirect("/admin/weekly-facts?error=stoor");
  }

  revalidateWeeklyFacts(slug);
  redirect(`/admin/weekly-facts/${slug}`);
}

export async function saveWeeklyFact(formData: FormData) {
  const supabase = await requireAdmin();
  const existingSlug = formText(formData, "existingSlug");
  const title = formText(formData, "title");
  const slug = existingSlug || slugify(formText(formData, "slug") || title);
  const grade = requiredGrade(formData);
  const tone = visualTones.find((value) => value === formText(formData, "tone")) ?? "green";
  const art = bioArtKinds.find((value) => value === formText(formData, "art")) ?? "leaf";
  const weekStart = formText(formData, "week_start") || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!existingSlug || !title || grade === null) {
    redirect("/admin/weekly-facts?error=fields");
  }

  const { error } = await supabase
    .from("weekly_facts")
    .update({
      title,
      body: formText(formData, "body"),
      category: formText(formData, "category"),
      grade,
      week_label: formText(formData, "week_label"),
      week_start: weekStart,
      tone,
      art,
      image_path: formText(formData, "image_path") || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("slug", existingSlug);

  if (error) {
    console.error("Failed to save weekly fact:", error.message);
    redirect(`/admin/weekly-facts/${existingSlug}?error=stoor`);
  }

  revalidateWeeklyFacts(slug);
  redirect(`/admin/weekly-facts/${existingSlug}?saved=1`);
}

export async function setWeeklyFactStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = formText(formData, "slug");
  const status = formText(formData, "status");

  if (!slug || !isWeeklyFactStatus(status)) {
    return;
  }

  const payload: Record<string, unknown> = { status };
  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("weekly_facts").update(payload).eq("slug", slug);

  if (error) {
    console.error("Failed to update weekly fact status:", error.message);
    return;
  }

  revalidateWeeklyFacts(slug);
  revalidatePath("/admin");
}

export async function deleteWeeklyFact(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = formText(formData, "slug");

  if (!slug) {
    return;
  }

  const { error } = await supabase.from("weekly_facts").delete().eq("slug", slug);

  if (error) {
    console.error("Failed to delete weekly fact:", error.message);
    return;
  }

  revalidateWeeklyFacts();
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const title = formText(formData, "title");
  const slug = slugify(formText(formData, "slug") || title);
  const listingKind = formText(formData, "listing_kind") === "bundle" ? "bundle" : "item";
  const grade = optionalGrade(formData);

  if (!title || !slug || (listingKind === "item" && grade === null)) {
    redirect("/admin/products?error=fields");
  }

  const { error } = await supabase.from("products").insert({
    slug,
    title,
    kind: formText(formData, "kind") || (listingKind === "bundle" ? "Bundel" : "Notas"),
    listing_kind: listingKind,
    grade,
    price: Number(formData.get("price") ?? 0) || 0,
    is_published: false,
  });

  if (error) {
    console.error("Failed to create product:", error.message);
    redirect("/admin/products?error=stoor");
  }

  revalidateShop(slug);
  redirect(`/admin/products/${slug}`);
}

export async function saveProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const existingSlug = formText(formData, "existingSlug");
  const title = formText(formData, "title");
  const listingKind = formText(formData, "listing_kind") === "bundle" ? "bundle" : "item";
  const grade = optionalGrade(formData);
  const tone = visualTones.find((value) => value === formText(formData, "tone")) ?? "navy";
  const price = Number(formData.get("price") ?? 0);
  const wasRaw = formText(formData, "was_price");
  const pagesRaw = formText(formData, "pages");
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!existingSlug || !title || (listingKind === "item" && grade === null)) {
    redirect(`/admin/products/${existingSlug || ""}?error=fields`);
  }

  const { error } = await supabase
    .from("products")
    .update({
      title,
      kind: formText(formData, "kind") || (listingKind === "bundle" ? "Bundel" : "Notas"),
      listing_kind: listingKind,
      grade,
      price: Number.isFinite(price) ? Math.max(0, price) : 0,
      was_price: wasRaw ? Number(wasRaw) || null : null,
      bullets: parseBulletLines(formText(formData, "bullets")),
      body: formText(formData, "body"),
      tone,
      badge: formText(formData, "badge") || null,
      pages: pagesRaw ? Number(pagesRaw) || null : null,
      image_path: formText(formData, "image_path") || null,
      is_published: formData.get("is_published") === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("slug", existingSlug);

  if (error) {
    console.error("Failed to save product:", error.message);
    redirect(`/admin/products/${existingSlug}?error=stoor`);
  }

  revalidateShop(existingSlug);
  revalidatePath("/admin");
  redirect(`/admin/products/${existingSlug}?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = formText(formData, "slug");

  if (!slug) {
    return;
  }

  const { error } = await supabase.from("products").delete().eq("slug", slug);

  if (error) {
    console.error("Failed to delete product:", error.message);
    return;
  }

  revalidateShop();
  revalidatePath("/admin");
}

export async function setEnquiryStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formText(formData, "id");
  const status = toEnquiryStatus(formText(formData, "status"));

  if (!id) {
    return;
  }

  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);

  if (error) {
    console.error("Failed to update enquiry:", error.message);
    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formText(formData, "id");

  if (!id) {
    return;
  }

  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete enquiry:", error.message);
    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function setCommentStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formText(formData, "id");
  const status = toCommentStatus(formText(formData, "status"));

  if (!id) {
    return;
  }

  const { error } = await supabase.from("comments").update({ status }).eq("id", id);

  if (error) {
    console.error("Failed to update comment:", error.message);
    return;
  }

  revalidatePath("/comments");
  revalidatePath("/admin/comments");
  revalidatePath("/admin");
}

function commentReturnPath(formData: FormData) {
  if (formText(formData, "return_to") !== "admin") {
    return "/comments";
  }

  const status = toCommentStatus(formText(formData, "status"));
  return status === "pending" ? "/admin/comments" : `/admin/comments?status=${status}`;
}

function withCommentFault(path: string, fault: string) {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("fout", fault);
  return `${base}?${params.toString()}`;
}

export async function replyToComment(formData: FormData) {
  const supabase = await requireAdmin();
  const back = commentReturnPath(formData);
  const parentId = formText(formData, "parent_id");
  const body = formText(formData, "body").slice(0, 4000);

  if (!parentId || !body) {
    redirect(withCommentFault(back, "antwoord"));
  }

  const { data: parent, error: parentError } = await supabase
    .from("comments")
    .select("id, parent_id")
    .eq("id", parentId)
    .maybeSingle();

  if (parentError || !parent) {
    console.error("Failed to find the comment being answered:", parentError?.message);
    redirect(withCommentFault(back, "stoor"));
  }

  const account = await getSessionAccount();
  const rootId = typeof parent.parent_id === "string" ? parent.parent_id : parent.id;
  const { error } = await supabase.from("comments").insert({
    author_name: (account?.name || "Onderwyser").slice(0, 80),
    kind: "Gedagte",
    body,
    grade: null,
    audience: null,
    status: "approved",
    parent_id: rootId,
    author_role: "teacher",
  });

  if (error) {
    console.error("Failed to save comment reply:", error.message);
    redirect(withCommentFault(back, "stoor"));
  }

  revalidatePath("/comments");
  revalidatePath("/admin/comments");
  revalidatePath("/admin");
  redirect(back);
}

export async function deleteNewsletterSubscriber(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formText(formData, "id");
  if (!id) {
    return;
  }

  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) {
    console.error("Failed to remove newsletter subscriber:", error.message);
    return;
  }

  revalidatePath("/admin/newsletter");
}

export async function deleteComment(formData: FormData) {
  const supabase = await requireAdmin();
  const id = formText(formData, "id");

  if (!id) {
    return;
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete comment:", error.message);
    return;
  }

  revalidatePath("/comments");
  revalidatePath("/admin/comments");
  revalidatePath("/admin");
}

export async function replyToChat(formData: FormData) {
  const supabase = await requireAdmin();
  const threadId = formText(formData, "thread_id");
  const body = formText(formData, "body");

  if (!threadId || !body) {
    return;
  }

  const { error } = await supabase.from("chat_messages").insert({
    thread_id: threadId,
    sender: "admin",
    body,
  });

  if (error) {
    console.error("Failed to send chat reply:", error.message);
    redirect(`/admin/live-chat?id=${threadId}&error=stoor`);
  }

  const { error: threadError } = await supabase
    .from("chat_threads")
    .update({
      unread_for_admin: false,
      unread_for_learner: true,
      status: "open",
      last_message: body.replace(/\s+/g, " ").trim().slice(0, 180),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", threadId);

  if (threadError) {
    console.error("Failed to update chat thread:", threadError.message);
  }

  revalidatePath("/live-chat");
  revalidatePath("/admin/live-chat");
  revalidatePath("/admin");
  redirect(`/admin/live-chat?id=${threadId}`);
}

export async function setChatThreadStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const threadId = formText(formData, "thread_id");
  const status = formText(formData, "status") === "closed" ? "closed" : "open";

  if (!threadId) {
    return;
  }

  const { error } = await supabase
    .from("chat_threads")
    .update({
      status,
      unread_for_admin: status === "open" ? true : false,
    })
    .eq("id", threadId);

  if (error) {
    console.error("Failed to update chat thread status:", error.message);
    return;
  }

  revalidatePath("/live-chat");
  revalidatePath("/admin/live-chat");
  revalidatePath("/admin");
  redirect(`/admin/live-chat?id=${threadId}`);
}

export async function deleteChatThread(formData: FormData) {
  const supabase = await requireAdmin();
  const threadId = formText(formData, "thread_id");

  if (!threadId) {
    return;
  }

  const { error } = await supabase.from("chat_threads").delete().eq("id", threadId);

  if (error) {
    console.error("Failed to delete chat thread:", error.message);
    return;
  }

  revalidatePath("/live-chat");
  revalidatePath("/admin/live-chat");
  revalidatePath("/admin");
  redirect("/admin/live-chat");
}

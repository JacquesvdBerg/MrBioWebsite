"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mediaBucket } from "@/lib/media-bucket";
import { requireAdmin } from "@/lib/require-admin";
import { parseQuizPayload } from "@/lib/quiz";
import { grades, isActivitySlug, isGrade } from "@/lib/site";
import { parseTrueOrFalsePayload } from "@/lib/true-or-false";
import { slugify } from "@/lib/slug";
import { getAiSettings, saveAiSettings } from "@/lib/ai-settings";
import { toCommentStatus } from "@/lib/comments";
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

export async function createAdminAccount(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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

  const { error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error) {
    redirect(`/admin/accounts?error=${accountCreateError(error.message)}`);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?created=1");
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
      is_featured: listingKind === "item" && formData.get("is_featured") === "on",
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

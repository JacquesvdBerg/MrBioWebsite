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
import { createClient } from "@/lib/supabase/server";
import { defaultThemePage, themePageFromForm } from "@/lib/theme-page";
import { themePath } from "@/lib/themes";

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

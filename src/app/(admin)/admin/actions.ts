"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mediaBucket } from "@/lib/media-bucket";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";
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

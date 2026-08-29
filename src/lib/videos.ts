import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type Video = {
  id: string;
  title: string;
  youtubeUrl: string;
  grade: number | null;
  topic: string;
  description: string;
  thumbnailPath: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type VideoRow = {
  id: string;
  title: string;
  youtube_url: string;
  grade: number | null;
  topic: string | null;
  description: string | null;
  thumbnail_path: string | null;
  sort_order: number;
  is_published: boolean;
};

const columns =
  "id, title, youtube_url, grade, topic, description, thumbnail_path, sort_order, is_published";

function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    grade: row.grade,
    topic: row.topic ?? "",
    description: row.description ?? "",
    thumbnailPath: row.thumbnail_path,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

export async function getPublishedVideos(): Promise<Video[]> {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("videos")
    .select(columns)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .returns<VideoRow[]>();

  if (error || !data) {
    console.error("Kon nie video's laai nie:", error?.message);
    return [];
  }

  return data.map(toVideo);
}

export async function getAllVideos(): Promise<Video[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("videos")
    .select(columns)
    .order("sort_order", { ascending: true })
    .returns<VideoRow[]>();

  if (error || !data) {
    console.error("Kon nie video's laai nie:", error?.message);
    return [];
  }

  return data.map(toVideo);
}

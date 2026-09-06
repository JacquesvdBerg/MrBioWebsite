import "server-only";
import { mediaBucket } from "@/lib/media-bucket";
import { requireAdmin } from "@/lib/require-admin";

export { mediaBucket };

export type MediaItem = {
  name: string;
  url: string;
};

export async function listMedia(): Promise<MediaItem[]> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.storage.from(mediaBucket).list("", {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data) {
    console.error("Kon nie media lys nie:", error?.message);
    return [];
  }

  return data
    .filter((item) => Boolean(item.id))
    .map((item) => {
      const { data: published } = supabase.storage
        .from(mediaBucket)
        .getPublicUrl(item.name);

      return { name: item.name, url: published.publicUrl };
    });
}

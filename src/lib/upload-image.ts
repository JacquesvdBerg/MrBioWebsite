import { createClient } from "@/lib/supabase/client";
import { mediaBucket } from "@/lib/media-bucket";

export async function uploadImageToStorage(file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${Date.now()}-${safeName}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(mediaBucket).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(path);
  return data.publicUrl;
}

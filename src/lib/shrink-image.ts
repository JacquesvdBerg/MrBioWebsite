/**
 * Scales a photo down to at most `max` pixels on its long side and saves it
 * as WebP before upload, so phone photos do not fill the storage. GIFs keep
 * their animation and anything that does not get smaller is left alone.
 */
export async function shrinkImage(file: File, max = 1600): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap === "undefined") {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    return file;
  }

  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 500_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob || blob.size >= file.size) {
    return file;
  }

  const name = `${file.name.replace(/\.[^.]+$/, "") || "prent"}.webp`;
  return new File([blob], name, { type: "image/webp" });
}

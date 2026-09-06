"use client";

import { useState } from "react";
import { uploadImageToStorage } from "@/lib/upload-image";

type ImageUploadFieldProps = {
  name?: string;
  label?: string;
  initialUrl?: string | null;
};

export function ImageUploadField({
  name = "image_path",
  label = "Prent",
  initialUrl = "",
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const publicUrl = await uploadImageToStorage(file);
      setUrl(publicUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie oplaai nie.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="text-sm font-semibold">
      <span>{label}</span>
      <input type="hidden" name={name} value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-2 h-28 w-full rounded-lg object-cover"
        />
      ) : null}
      <input
        className="mt-2 block w-full text-sm font-normal"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          void onFileChange(event.target.files?.[0]);
        }}
      />
      {pending ? (
        <p className="mt-1 text-xs font-normal text-white/50">Laai op na Storage…</p>
      ) : null}
      {error ? <p className="mt-1 text-xs font-normal text-orange">{error}</p> : null}
    </div>
  );
}

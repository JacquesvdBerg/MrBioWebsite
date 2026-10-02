"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AdminIcon } from "@/components/admin-icon";
import { uploadImageToStorage } from "@/lib/upload-image";

/** Drop zone: drag images in, or click to pick. Several files at once is fine. */
export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [over, setOver] = useState(false);

  async function upload(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      setError("Kies ’n prent (PNG, JPG, WebP of GIF).");
      return;
    }

    setError(null);
    setProgress({ done: 0, total: images.length });

    for (const [index, file] of images.entries()) {
      try {
        await uploadImageToStorage(file);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : `Kon nie ${file.name} oplaai nie.`);
      }
      setProgress({ done: index + 1, total: images.length });
    }

    setProgress(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    router.refresh();
  }

  return (
    <div>
      <label
        className={`desk-drop ${over ? "is-over" : ""} ${progress ? "is-busy" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void upload(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => void upload(Array.from(event.target.files ?? []))}
          disabled={Boolean(progress)}
        />
        <span className="desk-empty-icon">
          <AdminIcon name="image" className="h-6 w-6" />
        </span>
        {progress ? (
          <span className="mt-3 font-display font-bold text-white">
            Laai op… {progress.done} van {progress.total}
          </span>
        ) : (
          <>
            <span className="mt-3 font-display font-bold text-white">Sleep prente hierheen</span>
            <span className="mt-1 text-sm text-white/55">
              of <span className="font-bold text-lime">kies lêers</span> · PNG, JPG, WebP of GIF
            </span>
          </>
        )}
      </label>
      {error ? <p className="desk-notice is-err mt-3 mb-0">{error}</p> : null}
    </div>
  );
}

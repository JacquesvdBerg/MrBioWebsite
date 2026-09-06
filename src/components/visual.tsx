import Image from "next/image";
import { BioArt, type BioArtKind } from "@/components/bio-art";
import { publicFileUrl } from "@/lib/assets";

export type VisualTone =
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "orange"
  | "navy";

type VisualProps = {
  file: string | null;
  alt: string;
  ratio?: string;
  tone?: VisualTone;
  art?: BioArtKind;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Visual({
  file,
  alt,
  ratio,
  tone = "navy",
  art,
  className = "",
  sizes = "100vw",
  priority = false,
}: VisualProps) {
  const src = file ? publicFileUrl(file) : null;
  // Callers that pin the visual with `absolute inset-0` must not also get
  // `relative`, otherwise the later utility wins and the box collapses.
  const position = /\babsolute\b/.test(className) ? "" : "relative";

  return (
    <div
      className={`${position} overflow-hidden ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0">
          <BioArt tone={tone} kind={art} />
        </div>
      )}
    </div>
  );
}

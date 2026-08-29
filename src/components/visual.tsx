import Image from "next/image";
import { publicFileUrl } from "@/lib/assets";

export type VisualTone =
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "orange"
  | "navy";

const toneClass: Record<VisualTone, string> = {
  green: "ph ph-green",
  teal: "ph ph-teal",
  blue: "ph ph-blue",
  purple: "ph ph-purple",
  orange: "ph ph-orange",
  navy: "ph ph-navy",
};

type VisualProps = {
  file: string | null;
  alt: string;
  ratio?: string;
  tone?: VisualTone;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function Visual({
  file,
  alt,
  ratio,
  tone = "navy",
  className = "",
  sizes = "100vw",
  priority = false,
}: VisualProps) {
  const src = file ? publicFileUrl(file) : null;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
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
        <div className={`h-full w-full ${toneClass[tone]}`}>
          {file ? (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-black/30 px-2 py-0.5 font-mono text-[10px] leading-4 text-white/70">
              {file}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

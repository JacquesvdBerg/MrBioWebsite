import type { VisualTone } from "@/components/visual";
import type { BioArtKind } from "@/components/bio-art";

export const visualTones = ["green", "teal", "blue", "purple", "orange", "navy"] as const;

export const bioArtKinds = ["cell", "dna", "leaf", "heart", "microbe", "eye", "molecule"] as const;

export function toVisualTone(value: string): VisualTone {
  return visualTones.find((tone) => tone === value) ?? "navy";
}

export function toBioArtKind(value: string): BioArtKind {
  return bioArtKinds.find((kind) => kind === value) ?? "leaf";
}
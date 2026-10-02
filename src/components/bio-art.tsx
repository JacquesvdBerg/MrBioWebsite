import type { VisualTone } from "@/components/visual";

export type BioArtKind =
  | "cell"
  | "dna"
  | "leaf"
  | "heart"
  | "microbe"
  | "eye"
  | "molecule";

type BioArtProps = {
  kind?: BioArtKind;
  tone?: VisualTone;
  className?: string;
};

// Theme tokens, so placeholder art is bright on the light site and glows on
// the dark one. `ink` draws the subject, `glow` adds a second colour.
const palette: Record<VisualTone, { ink: string; glow: string }> = {
  green: { ink: "var(--lime)", glow: "var(--sun)" },
  teal: { ink: "var(--mint)", glow: "var(--sky)" },
  blue: { ink: "var(--sky)", glow: "var(--violet)" },
  purple: { ink: "var(--violet)", glow: "var(--coral)" },
  orange: { ink: "var(--coral)", glow: "var(--sun)" },
  navy: { ink: "var(--lime)", glow: "var(--sky)" },
};

const detail = "var(--fg)";
const paper = "var(--bg-2)";

const toneKind: Record<VisualTone, BioArtKind> = {
  green: "leaf",
  teal: "cell",
  blue: "molecule",
  purple: "microbe",
  orange: "heart",
  navy: "dna",
};

function Shape({ kind, ink, glow }: { kind: BioArtKind; ink: string; glow: string }) {
  switch (kind) {
    case "cell":
      return (
        <g>
          <ellipse cx="200" cy="150" rx="118" ry="96" fill={glow} opacity="0.18" />
          <ellipse
            cx="200"
            cy="150"
            rx="118"
            ry="96"
            fill="none"
            stroke={ink}
            strokeWidth="4"
          />
          <ellipse cx="200" cy="150" rx="102" ry="82" fill="none" stroke={ink} strokeWidth="1.5" opacity="0.5" />
          <circle cx="192" cy="142" r="30" fill={ink} opacity="0.85" />
          <circle cx="184" cy="134" r="8" fill={detail} opacity="0.6" />
          <ellipse cx="258" cy="120" rx="16" ry="9" fill={glow} opacity="0.8" transform="rotate(-25 258 120)" />
          <ellipse cx="150" cy="190" rx="16" ry="9" fill={glow} opacity="0.8" transform="rotate(30 150 190)" />
          <ellipse cx="250" cy="185" rx="12" ry="7" fill={glow} opacity="0.6" transform="rotate(10 250 185)" />
          <circle cx="140" cy="125" r="5" fill={glow} />
          <circle cx="230" cy="95" r="4" fill={glow} />
        </g>
      );
    case "dna":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M120 40c80 40 80 80 0 120s-80 80 0 120" stroke={ink} strokeWidth="5" />
          <path d="M280 40c-80 40-80 80 0 120s80 80 0 120" stroke={glow} strokeWidth="5" />
          {[62, 88, 112, 136, 160, 184, 208, 232, 256].map((y) => (
            <path key={y} d={`M${200 - 55 * Math.abs(Math.sin((y - 40) / 76))} ${y}h${110 * Math.abs(Math.sin((y - 40) / 76))}`} stroke={detail} strokeOpacity="0.45" strokeWidth="3" />
          ))}
        </g>
      );
    case "leaf":
      return (
        <g>
          <path
            d="M110 230C110 120 200 60 300 60c0 110-60 200-170 200-10 0-20-10-20-30Z"
            fill={ink}
            opacity="0.9"
          />
          <path d="M120 232C170 170 220 130 290 76" stroke={detail} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M160 190c20-10 40-30 55-55M195 160c25-5 50-20 70-45M140 214c10-20 25-40 40-55" stroke={detail} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
          <circle cx="90" cy="90" r="6" fill={glow} />
          <circle cx="320" cy="200" r="9" fill={glow} opacity="0.7" />
        </g>
      );
    case "heart":
      return (
        <g>
          <path
            d="M200 250s-95-60-95-125a48 48 0 0 1 95-12 48 48 0 0 1 95 12c0 65-95 125-95 125Z"
            fill={ink}
            opacity="0.92"
          />
          <path d="M120 150h40l15-30 20 60 18-40 12 20h60" stroke={detail} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
          <circle cx="300" cy="80" r="7" fill={glow} />
        </g>
      );
    case "microbe":
      return (
        <g>
          <path
            d="M200 90c40 0 75 30 75 65s-30 65-75 65-75-30-75-65 35-65 75-65Z"
            fill={ink}
            opacity="0.9"
          />
          {[
            [200, 88, 200, 55],
            [260, 110, 290, 90],
            [275, 160, 315, 165],
            [255, 205, 285, 235],
            [200, 220, 200, 255],
            [145, 205, 115, 235],
            [125, 160, 85, 165],
            [140, 110, 110, 90],
          ].map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="6" strokeLinecap="round" />
          ))}
          <circle cx="185" cy="140" r="14" fill={detail} opacity="0.6" />
          <circle cx="222" cy="168" r="10" fill={detail} opacity="0.5" />
          <circle cx="205" cy="125" r="5" fill={glow} />
        </g>
      );
    case "eye":
      return (
        <g>
          <path d="M70 150c60-80 200-80 260 0-60 80-200 80-260 0Z" fill={ink} opacity="0.9" />
          <circle cx="200" cy="150" r="48" fill={detail} opacity="0.85" />
          <circle cx="200" cy="150" r="22" fill={glow} />
          <circle cx="184" cy="134" r="8" fill={paper} opacity="0.9" />
        </g>
      );
    case "molecule":
      return (
        <g>
          {[
            [140, 110, 200, 80],
            [200, 80, 260, 110],
            [260, 110, 260, 180],
            [260, 180, 200, 215],
            [200, 215, 140, 180],
            [140, 180, 140, 110],
            [200, 80, 200, 30],
            [260, 180, 310, 210],
            [140, 180, 90, 210],
          ].map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}-${x2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={detail} strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
          ))}
          {[
            [140, 110],
            [200, 80],
            [260, 110],
            [260, 180],
            [200, 215],
            [140, 180],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="16" fill={ink} />
          ))}
          <circle cx="200" cy="30" r="10" fill={glow} />
          <circle cx="310" cy="210" r="10" fill={glow} />
          <circle cx="90" cy="210" r="10" fill={glow} />
        </g>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function BioArt({ kind, tone = "navy", className = "" }: BioArtProps) {
  const colors = palette[tone];
  const resolved = kind ?? toneKind[tone];
  const gradientId = `bioart-${tone}`;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`color-mix(in srgb, ${colors.ink} 18%, ${paper})`} />
          <stop offset="1" stopColor={`color-mix(in srgb, ${colors.ink} 6%, ${paper})`} />
        </linearGradient>
        <radialGradient id={`${gradientId}-glow`} cx="0.8" cy="0.2" r="0.7">
          <stop offset="0" stopColor={colors.glow} stopOpacity="0.25" />
          <stop offset="1" stopColor={colors.glow} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${gradientId}-dots`} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill={detail} opacity="0.12" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradientId})`} />
      <rect width="400" height="300" fill={`url(#${gradientId}-glow)`} />
      <rect width="400" height="300" fill={`url(#${gradientId}-dots)`} />
      <Shape kind={resolved} ink={colors.ink} glow={colors.glow} />
    </svg>
  );
}

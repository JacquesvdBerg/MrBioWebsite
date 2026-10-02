import type { Grade } from "@/lib/site";

type GradeIconProps = {
  grade: Grade;
  className?: string;
};

// One duotone icon per grade, drawn on a 48px grid. Stroke and fill follow
// currentColor so the card's accent colours them in both themes.
export function GradeIcon({ grade, className = "h-9 w-9" }: GradeIconProps) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const tint = { fill: "currentColor", fillOpacity: 0.18 };

  switch (grade) {
    // Seedling: plants, photosynthesis and the start of the journey.
    case 8:
      return (
        <svg {...common}>
          <path d="M11 41.5h26" />
          <path d="M15.5 41.5c1.8-3.2 5-4.6 8.5-4.6s6.7 1.4 8.5 4.6" {...tint} />
          <path d="M24 37V21" />
          <path d="M24 26.5C24 19.6 19.2 14.6 10.5 14.6c0 8 5.2 11.9 13.5 11.9Z" {...tint} />
          <path d="M24 21.5c0-8.2 5.2-13 14.2-13 0 9-6.1 13-14.2 13Z" {...tint} />
          <path d="M23.4 25.8 14.6 18.2M24.6 20.8l8.6-7.4" strokeOpacity={0.55} />
        </svg>
      );
    // Heart with a pulse: the human body systems.
    case 9:
      return (
        <svg {...common}>
          <path
            d="M24 40.5S9 31.9 9 21c0-5.5 3.6-9.5 8.2-9.5 3 0 5.4 1.6 6.8 4 1.4-2.4 3.8-4 6.8-4 4.6 0 8.2 4 8.2 9.5 0 10.9-15 19.5-15 19.5Z"
            {...tint}
          />
          <path d="M4.5 25h9.5l3-5.5 4.2 10.5 3.6-8.5 2.6 3.5H43.5" />
        </svg>
      );
    // Animal cell: cells, tissues and the chemistry of life.
    case 10:
      return (
        <svg {...common}>
          <path
            d="M24.5 6C34.3 6 42 13.4 42 23.4 42 33.8 34.6 42 23.6 42 13.2 42 6 34.6 6 24.6 6 14.1 13.9 6 24.5 6Z"
            {...tint}
          />
          <circle cx="20.5" cy="21.5" r="7" fill="currentColor" fillOpacity={0.3} />
          <circle cx="21.5" cy="20.5" r="2.3" fill="currentColor" stroke="none" />
          <g transform="rotate(-28 32.5 31.5)">
            <rect x="26.5" y="28.3" width="12" height="6.4" rx="3.2" />
            <path d="M29 31.5l1.4-1.6 1.4 3.2 1.4-3.2 1.4 3.2 1.4-1.6" strokeWidth={1.5} />
          </g>
          <g fill="currentColor" stroke="none">
            <circle cx="13.5" cy="32" r="1.4" />
            <circle cx="17.5" cy="35.5" r="1.1" />
            <circle cx="31.5" cy="13.5" r="1.4" />
            <circle cx="35.5" cy="19" r="1.1" />
          </g>
        </svg>
      );
    // Lungs: life processes, gas exchange and respiration.
    case 11:
      return (
        <svg {...common}>
          <path d="M24 5v14.5M24 19.5l-5 5M24 19.5l5 5" />
          <path
            d="M18.6 13.2C12.4 14.3 8 22.6 7.1 32.4c-.4 4.4 2.5 7.1 6.6 5.9l5.4-1.6c1.6-.5 2.4-1.7 2.4-3.4V17.5c0-2.8-1-4.6-2.9-4.3Z"
            {...tint}
          />
          <path
            d="M29.4 13.2c6.2 1.1 10.6 9.4 11.5 19.2.4 4.4-2.5 7.1-6.6 5.9l-5.4-1.6c-1.6-.5-2.4-1.7-2.4-3.4V17.5c0-2.8 1-4.6 2.9-4.3Z"
            {...tint}
          />
          <path d="M16.5 28.5l-4 3.5M17 33l-2.5 2.6M31.5 28.5l4 3.5M31 33l2.5 2.6" strokeOpacity={0.55} />
        </svg>
      );
    // Double helix: DNA, genetics and evolution.
    case 12:
      return (
        <svg {...common}>
          <path d="M16.1 9.3h15.8M16.1 19.7h15.8M15.2 24h17.6M16.1 28.3h15.8M16.1 38.7h15.8" strokeOpacity={0.55} />
          <path d="M34 5c0 8-20 11-20 19s20 11 20 19" strokeOpacity={0.6} />
          <path d="M14 5c0 8 20 11 20 19s-20 11-20 19" />
        </svg>
      );
    default: {
      const _exhaustive: never = grade;
      return _exhaustive;
    }
  }
}

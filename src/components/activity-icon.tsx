import type { ActivitySlug } from "@/lib/site";

type ActivityIconProps = {
  kind: ActivitySlug;
  className?: string;
};

export function ActivityIcon({ kind, className = "h-6 w-6" }: ActivityIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "quiz":
      return (
        <svg {...common}>
          <path d="M4 6.5h2.2M4 12h2.2M4 17.5h2.2M10 6.5h10M10 12h10M10 17.5h10" />
        </svg>
      );
    case "true-or-false":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="10" rx="5" />
          <circle cx="15.5" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "word-search":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="13" height="13" rx="2" />
          <path d="M7 7h1M11 7h1M7 11h1M11 11h1" />
          <circle cx="16.5" cy="16.5" r="3.5" />
          <path d="M19 19l2.5 2.5" />
        </svg>
      );
    case "crossword":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "match-the-pairs":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="7" height="6" rx="2" />
          <rect x="14" y="14" width="7" height="6" rx="2" />
          <path d="M10 7h4a3 3 0 0 1 3 3v4" />
        </svg>
      );
    case "put-in-order":
      return (
        <svg {...common}>
          <path d="M8 4v16M8 4l-3 3M8 4l3 3M16 20V4M16 20l-3-3M16 20l3-3" />
        </svg>
      );
    case "diagram":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <path d="M14 10l6-6M4 20l6-6" />
        </svg>
      );
    case "memory-cards":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="9" height="14" rx="2" />
          <rect x="12" y="5" width="9" height="14" rx="2" fill="currentColor" fillOpacity="0.35" />
          <path d="M16.5 10v4" />
        </svg>
      );
    case "sorting":
      return (
        <svg {...common}>
          <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />
        </svg>
      );
    case "speed-quiz":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

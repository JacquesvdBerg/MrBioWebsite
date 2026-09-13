import type { AdminIconName } from "@/lib/admin";

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function AdminIcon({ name, className = "h-4 w-4" }: { name: AdminIconName; className?: string }) {
  switch (name) {
    case "home":
      return (
        <svg {...common} className={className}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "theme":
      return (
        <svg {...common} className={className}>
          <path d="M4 7h16M4 12h10M4 17h7" />
          <circle cx="18" cy="16.5" r="3" />
        </svg>
      );
    case "video":
      return (
        <svg {...common} className={className}>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10 5-3v10l-5-3z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common} className={className}>
          <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
          <path d="M5 19c3-4 6-7 10-10" />
        </svg>
      );
    case "puzzle":
      return (
        <svg {...common} className={className}>
          <path d="M9 4h3a2 2 0 1 1 4 0h3v5a2 2 0 1 1 0 4v6h-5a2 2 0 1 1-4 0H5v-5a2 2 0 1 1 0-4V4h4Z" />
        </svg>
      );
    case "list":
      return (
        <svg {...common} className={className}>
          <path d="M9 7h11M9 12h11M9 17h11M5 7h.01M5 12h.01M5 17h.01" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common} className={className}>
          <path d="M6 7h13l-1.5 8h-10z" />
          <path d="M6 7 5 4H3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common} className={className}>
          <path d="M4 8 12 3l8 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M4 13h4.5L10 16h4l1.5-3H20" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common} className={className}>
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z" />
          <path d="M8 9h8M8 12.5h5" />
        </svg>
      );
    case "comment":
      return (
        <svg {...common} className={className}>
          <path d="M3 5h12v8H7l-4 3z" />
          <path d="M15 9h6v8l-3-2h-6v-2" />
        </svg>
      );
    case "image":
      return (
        <svg {...common} className={className}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m21 15-5-4-9 8" />
        </svg>
      );
    case "users":
      return (
        <svg {...common} className={className}>
          <path d="M16 19v-1.2A3.8 3.8 0 0 0 12.2 14H7.8A3.8 3.8 0 0 0 4 17.8V19" />
          <circle cx="10" cy="8" r="3" />
          <path d="M20 19v-1.1A3.4 3.4 0 0 0 17.2 14.7M16 5.1a3 3 0 0 1 0 5.8" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6" />
        </svg>
      );
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

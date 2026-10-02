export type AdminIconName =
  | "home"
  | "theme"
  | "video"
  | "leaf"
  | "puzzle"
  | "list"
  | "cart"
  | "inbox"
  | "chat"
  | "comment"
  | "image"
  | "users"
  | "settings"
  | "plus"
  | "external"
  | "logout"
  | "search"
  | "spark"
  | "check"
  | "trash"
  | "copy"
  | "arrow"
  | "back";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: AdminIconName;
};

export type AdminNavGroup = {
  title: string;
  items: readonly AdminNavItem[];
};

export const adminNavGroups: readonly AdminNavGroup[] = [
  {
    title: "Werk",
    items: [
      {
        href: "/admin",
        label: "Oorsig",
        description: "Syfers, waglys en vinnige aksies.",
        icon: "home",
      },
    ],
  },
  {
    title: "Inhoud",
    items: [
      {
        href: "/admin/themes",
        label: "Temas",
        description: "Sillabus-temas en hul bladsye.",
        icon: "theme",
      },
      {
        href: "/admin/videos",
        label: "Video’s",
        description: "YouTube-lesse per graad.",
        icon: "video",
      },
      {
        href: "/admin/weekly-facts",
        label: "Weeklikse feite",
        description: "Konsep, hersien, publiseer.",
        icon: "leaf",
      },
      {
        href: "/admin/activities",
        label: "Aktiwiteite",
        description: "Vasvrae en oefeninge.",
        icon: "puzzle",
      },
      {
        href: "/admin/topics",
        label: "Onderwerpe",
        description: "Bank vir die daaglikse AI-jobs.",
        icon: "list",
      },
    ],
  },
  {
    title: "Winkel",
    items: [
      {
        href: "/admin/products",
        label: "Produkte",
        description: "Notas, pakke en pryse.",
        icon: "cart",
      },
      {
        href: "/admin/enquiries",
        label: "Navrae",
        description: "Bestellings en produkvrae.",
        icon: "inbox",
      },
    ],
  },
  {
    title: "Gemeenskap",
    items: [
      {
        href: "/admin/live-chat",
        label: "Lewendige klets",
        description: "Vrae van leerders.",
        icon: "chat",
      },
      {
        href: "/admin/comments",
        label: "Kommentaar",
        description: "Modereer die forum.",
        icon: "comment",
      },
    ],
  },
  {
    title: "Stelsel",
    items: [
      {
        href: "/admin/media",
        label: "Media",
        description: "Prente vir temas, feite en lesse.",
        icon: "image",
      },
      {
        href: "/admin/accounts",
        label: "Rekeninge",
        description: "Skep admin-rekeninge vir die span.",
        icon: "users",
      },
      {
        href: "/admin/settings",
        label: "Instellings",
        description: "AI-huisreëls en nagtaak.",
        icon: "settings",
      },
    ],
  },
];

export const adminNavItems = adminNavGroups.flatMap((group) => group.items);

export const adminQuickActions: readonly AdminNavItem[] = [
  {
    href: "/admin/activities/quiz/new",
    label: "Nuwe vasvra",
    description: "Skryf vrae met een regte antwoord elk.",
    icon: "puzzle",
  },
  {
    href: "/admin/activities/true-or-false/new",
    label: "Nuwe waar of onwaar",
    description: "Vinnige stellings om kennis te toets.",
    icon: "check",
  },
  {
    href: "/admin/weekly-facts",
    label: "Nuwe weeklikse feit",
    description: "Begin ’n konsep vir hierdie week.",
    icon: "leaf",
  },
  {
    href: "/admin/videos",
    label: "Sit ’n les op",
    description: "Plak ’n YouTube-skakel by.",
    icon: "video",
  },
  {
    href: "/admin/products",
    label: "Nuwe produk",
    description: "Notas, werkkaarte of ’n bundel.",
    icon: "cart",
  },
  {
    href: "/admin/media",
    label: "Laai ’n prent op",
    description: "Vir temas, feite en produkte.",
    icon: "image",
  },
];

/** Section title for the breadcrumb, e.g. "Inhoud" for /admin/videos. */
export function adminGroupFor(pathname: string) {
  return (
    adminNavGroups.find((group) =>
      group.items.some((item) => isAdminNavActive(pathname, item.href)),
    )?.title ?? null
  );
}

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

export function activityKindLabel(kind: string) {
  switch (kind) {
    case "quiz":
      return "Vasvra";
    case "true-or-false":
      return "Waar of onwaar";
    case "word-search":
      return "Woordsoektog";
    case "crossword":
      return "Kruiswoord";
    case "match-the-pairs":
      return "Pas die pare";
    case "put-in-order":
      return "Sit in volgorde";
    case "diagram":
      return "Diagramme";
    case "memory-cards":
      return "Geheuekaarte";
    case "sorting":
      return "Sorteer";
    case "speed-quiz":
      return "Spoedvasvra";
    default:
      return kind;
  }
}

export function adminPageMeta(pathname: string) {
  const exact = adminNavItems.find((item) => item.href === pathname);
  if (exact) {
    return exact;
  }
  return adminNavItems.find((item) => item.href !== "/admin" && pathname.startsWith(item.href)) ?? null;
}

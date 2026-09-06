export const siteName = "MrBio";
export const siteTagline = "Lewenswetenskappe";

export type NavChild = {
  href: string;
  label: string;
  description: string;
  icon: "book" | "play" | "leaf" | "puzzle" | "chat" | "forum" | "cart";
};

export type NavItem = {
  href: string;
  label: string;
  children?: readonly NavChild[];
};

export const publicNav: readonly NavItem[] = [
  { href: "/", label: "Tuis" },
  {
    href: "/shop",
    label: "Studiemateriaal",
    children: [
      {
        href: "/shop",
        label: "Notas & eksamenpakke",
        description: "Sillabusgerigte hulpbronne per graad, PDF of gedruk.",
        icon: "cart",
      },
      {
        href: "/shop#bundels",
        label: "Klasbundels",
        description: "Afslag vir onderwysers en studiegroepe.",
        icon: "book",
      },
    ],
  },
  {
    href: "/video-lessons",
    label: "Leer",
    children: [
      {
        href: "/video-lessons",
        label: "Videolesse",
        description: "Kort, duidelike lesse in Afrikaans.",
        icon: "play",
      },
      {
        href: "/#temas",
        label: "Temas",
        description: "Die groot idees van die sillabus, een vir een.",
        icon: "leaf",
      },
      {
        href: "/weekly-facts",
        label: "Weeklikse feite",
        description: "Een feit per week wat jy nooit vergeet.",
        icon: "leaf",
      },
      {
        href: "/play-and-learn",
        label: "Oefen & toets",
        description: "Vasvrae, kruiswoorde en meer om kennis vas te lê.",
        icon: "puzzle",
      },
    ],
  },
  {
    href: "/comments",
    label: "Gemeenskap",
    children: [
      {
        href: "/live-chat",
        label: "Vra die onderwyser",
        description: "Stuur ’n vraag, kry ’n regte antwoord.",
        icon: "chat",
      },
      {
        href: "/comments",
        label: "Forum",
        description: "Stel onderwerpe voor en stem.",
        icon: "forum",
      },
    ],
  },
  { href: "/about", label: "Oor ons" },
];

export const footerNav = [
  {
    title: "Leer",
    links: [
      { href: "/shop", label: "Studiemateriaal" },
      { href: "/video-lessons", label: "Videolesse" },
      { href: "/weekly-facts", label: "Weeklikse feite" },
      { href: "/#temas", label: "Temas" },
      { href: "/play-and-learn", label: "Oefen & toets" },
    ],
  },
  {
    title: "Gemeenskap",
    links: [
      { href: "/comments", label: "Forum" },
      { href: "/live-chat", label: "Vra die onderwyser" },
    ],
  },
  {
    title: "MrBio",
    links: [
      { href: "/about", label: "Oor ons" },
      { href: "/contact", label: "Kontak" },
      { href: "/login", label: "Onderwyser teken in" },
    ],
  },
] as const;

export const destinations = [
  {
    href: "/weekly-facts",
    title: "Weeklikse feite",
    description: "Interessanthede oor die lewe wat weekliks verander.",
    vision: "vision/public/weekly-facts",
  },
  {
    href: "/shop",
    title: "Winkel",
    description: "Notas, werkkaarte en eksamenpakke om te bekyk.",
    vision: "vision/public/shop",
  },
  {
    href: "/video-lessons",
    title: "Videolesse",
    description: "Gratis sillabuslesse vir graad 10 tot 12.",
    vision: "vision/public/video-lessons",
  },
  {
    href: "/live-chat",
    title: "Lewendige klets",
    description: "Vra jou Lewenswetenskappe-vraag aan die onderwyser.",
    vision: "vision/public/live-chat",
  },
  {
    href: "/comments",
    title: "Kommentaar",
    description: "Stel onderwerpe voor en deel jou terugvoer.",
    vision: "vision/public/comments-suggestions",
  },
  {
    href: "/play-and-learn",
    title: "Oefen & toets",
    description: "Vasvrae, woordsoektogte en interaktiewe aktiwiteite.",
    vision: "vision/public/play-and-learn",
  },
] as const;

export const homeFeatures = [
  {
    title: "Interessante feite",
    description: "Leer iets nuuts elke dag",
    href: "/weekly-facts",
    icon: "leaf",
  },
  {
    title: "Duidelike lesse",
    description: "Gr. 10 – 12 en meer",
    href: "/video-lessons",
    icon: "book",
  },
  {
    title: "Video's & animasies",
    description: "Sien dit. Verstaan dit beter.",
    href: "/video-lessons",
    icon: "play",
  },
  {
    title: "Aktiwiteite & vasvrae",
    description: "Toets jou kennis!",
    href: "/play-and-learn",
    icon: "puzzle",
  },
] as const;

export const homeStats = [
  { value: 3, suffix: "", label: "Grade (10–12)" },
  { value: 40, suffix: "+", label: "Notas & eksamenpakke" },
  { value: 60, suffix: "+", label: "Videolesse" },
  { value: 100, suffix: "%", label: "Afrikaans, CAPS-gerig" },
] as const;

export const homeShortcuts = [
  { title: "Werkkaarte & hulpbronne", href: "/shop", icon: "document" },
  { title: "Hoofstroom konteks", href: "/about", icon: "brain" },
  { title: "YouTube kanaal", href: "/video-lessons", icon: "youtube" },
  { title: "Leerderforum & chat", href: "/live-chat", icon: "chat" },
  { title: "Winkel", href: "/shop", icon: "cart" },
] as const;

export const grades = [10, 11, 12] as const;

export type Grade = (typeof grades)[number];

export function isGrade(value: string | number): value is Grade {
  const grade = typeof value === "string" ? Number(value) : value;
  return (grades as readonly number[]).includes(grade);
}

export function gradeActivitiesPath(grade: number) {
  return `/play-and-learn/graad/${grade}`;
}

export const activityTypes = [
  {
    slug: "quiz",
    title: "Vasvra",
    description: "Meerkeusevrae met telling en verduidelikings.",
    accent: "var(--lime)",
    minutes: "5–15 min",
  },
  {
    slug: "true-or-false",
    title: "Waar of onwaar",
    description: "Vinnige stellings om kennis te toets.",
    accent: "var(--mint)",
    minutes: "3–10 min",
  },
  {
    slug: "word-search",
    title: "Woordsoektog",
    description: "Vind vakterme in ’n gegenereerde rooster.",
    accent: "var(--sky)",
    minutes: "5 min",
  },
  {
    slug: "crossword",
    title: "Kruiswoord",
    description: "Leidrade en antwoorde wat die rooster bou.",
    accent: "var(--sun)",
    minutes: "10 min",
  },
  {
    slug: "match-the-pairs",
    title: "Pas die pare",
    description: "Koppel terme aan die regte betekenis.",
    accent: "var(--violet)",
    minutes: "4 min",
  },
  {
    slug: "put-in-order",
    title: "Sit in volgorde",
    description: "Rangskik prosesse soos mitose of vertering.",
    accent: "var(--coral)",
    minutes: "5 min",
  },
  {
    slug: "diagram",
    title: "Diagramme",
    description: "Merk strukture en plaas etikette op sketse.",
    accent: "var(--sky)",
    minutes: "6 min",
  },
  {
    slug: "memory-cards",
    title: "Geheuekaarte",
    description: "Draai kaarte om om pare te onthou.",
    accent: "var(--violet)",
    minutes: "4 min",
  },
  {
    slug: "sorting",
    title: "Sorteer",
    description: "Groepeer items in die regte kategorieë.",
    accent: "var(--mint)",
    minutes: "5 min",
  },
  {
    slug: "speed-quiz",
    title: "Spoedvasvra",
    description: "Getimede vrae vir hersiening onder druk.",
    accent: "var(--coral)",
    minutes: "3 min",
  },
] as const;

export const gradeAccents: Record<Grade, string> = {
  10: "var(--sky)",
  11: "var(--violet)",
  12: "var(--sun)",
};

export const gradeBlurbs: Record<Grade, string> = {
  10: "Chemie van lewe, selle, weefsels, ekosisteme en biodiversiteit.",
  11: "Klassifikasie, lewensprosesse, gaswisseling en die omgewing.",
  12: "DNA, voortplanting, homeostase, genetika en evolusie.",
};

export type ActivitySlug = (typeof activityTypes)[number]["slug"];

export function isActivitySlug(value: string): value is ActivitySlug {
  return activityTypes.some((activity) => activity.slug === value);
}

export function gradeTypePath(grade: number, type: ActivitySlug) {
  return `/play-and-learn/graad/${grade}/${type}`;
}

export { adminNavItems as adminNav } from "@/lib/admin";

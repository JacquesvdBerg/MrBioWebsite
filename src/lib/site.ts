export const siteName = "MnrBio";
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
  { href: "/graad", label: "Grade" },
  { href: "/shop", label: "Winkel" },
  { href: "/play-and-learn", label: "Speletjies" },
  { href: "/live-chat", label: "Klets" },
];

export const footerNav = [
  {
    title: "Grade",
    links: [
      { href: "/graad/8", label: "Graad 8" },
      { href: "/graad/9", label: "Graad 9" },
      { href: "/graad/10", label: "Graad 10" },
      { href: "/graad/11", label: "Graad 11" },
      { href: "/graad/12", label: "Graad 12" },
    ],
  },
  {
    title: "Winkel",
    links: [
      { href: "/shop", label: "Winkel" },
      { href: "/play-and-learn", label: "Speletjies" },
      { href: "/weekly-facts", label: "Weeklikse feite" },
    ],
  },
  {
    title: "Gemeenskap",
    links: [
      { href: "/comments", label: "Forum" },
      { href: "/live-chat", label: "Klets" },
    ],
  },
  {
    title: "MnrBio",
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

export const grades = [8, 9, 10, 11, 12] as const;

export type Grade = (typeof grades)[number];

/** Grades the weekly game jobs still generate. 8 and 9 wait for a year plan. */
export const jobGrades = [10, 11, 12] as const;

export function isGrade(value: string | number): value is Grade {
  const grade = typeof value === "string" ? Number(value) : value;
  return (grades as readonly number[]).includes(grade);
}

export function isJobGrade(value: number) {
  return (jobGrades as readonly number[]).includes(value);
}

export function gradePath(grade: number) {
  return `/graad/${grade}`;
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
  8: "var(--lime)",
  9: "var(--mint)",
  10: "var(--sky)",
  11: "var(--violet)",
  12: "var(--coral)",
};

// Bright subject-card colours from the concept (light end, deep end), used
// for grade cards and the shop's grade choice in both themes.
export const gradeColors: Record<Grade, readonly [string, string]> = {
  8: ["#3aab48", "#1c7832"],
  9: ["#20b0a6", "#0c7a80"],
  10: ["#3283e3", "#1a4ea8"],
  11: ["#7d5ee2", "#4d2fad"],
  12: ["#f4932a", "#d95416"],
};

// The teacher's illustration for each grade, shown on the grade cards.
export const gradeImages: Record<Grade, string> = {
  8: "/images/grades/graad-8.jpg",
  9: "/images/grades/graad-9.jpg",
  10: "/images/grades/graad-10.jpg",
  11: "/images/grades/graad-11.jpg",
  12: "/images/grades/graad-12.jpg",
};

export const gradeBlurbs: Record<Grade, string> = {
  8: "Die begin van die reis: plante, diere en die lewe rondom jou.",
  9: "Die menslike liggaam: selle, stelsels en hoe alles saamwerk.",
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

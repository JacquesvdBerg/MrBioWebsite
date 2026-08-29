export const siteName = "WetenskapWêreld";
export const siteTagline = "Lewenswetenskappe";

export const publicNav = [
  { href: "/", label: "Tuis" },
  { href: "/about", label: "Oor ons" },
  { href: "/#leer", label: "Leer" },
  { href: "/video-lessons", label: "Video's" },
  { href: "/play-and-learn", label: "Aktiwiteite" },
  { href: "/shop", label: "Winkel" },
  { href: "/comments", label: "Forum" },
  { href: "/contact", label: "Kontak" },
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
    description: "Gratis sillabuslesse vir graad 8 tot 12.",
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
    title: "Speel & leer",
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
    description: "Gr. 8 – 12 en meer",
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
  { value: "40+", label: "Videolesse" },
  { value: "8–12", label: "Grade" },
  { value: "100%", label: "Afrikaans" },
] as const;

export const homeShortcuts = [
  { title: "Werkkaarte & hulpbronne", href: "/shop", icon: "document" },
  { title: "Hoofstroom konteks", href: "/about", icon: "brain" },
  { title: "YouTube kanaal", href: "/video-lessons", icon: "youtube" },
  { title: "Leerderforum & chat", href: "/live-chat", icon: "chat" },
  { title: "Winkel", href: "/shop", icon: "cart" },
] as const;

export const grades = [8, 9, 10, 11, 12] as const;

export const activityTypes = [
  { slug: "quiz", title: "Vasvra", description: "Meerkeusevrae met telling en verduidelikings." },
  { slug: "true-or-false", title: "Waar of onwaar", description: "Vinnige stellings om kennis te toets." },
  { slug: "word-search", title: "Woordsoektog", description: "Vind vakterme in 'n gegenereerde rooster." },
  { slug: "crossword", title: "Kruiswoord", description: "Leidrade en antwoorde wat die rooster bou." },
  { slug: "match-the-pairs", title: "Pas die pare", description: "Koppel terme aan die regte betekenis." },
  { slug: "put-in-order", title: "Sit in volgorde", description: "Rangskik prosesse soos mitose of vertering." },
  { slug: "diagram", title: "Diagramme", description: "Merk strukture en sleep etikette op sketse." },
  { slug: "memory-cards", title: "Geheuekaarte", description: "Draai kaarte om om pare te onthou." },
  { slug: "sorting", title: "Sorteer", description: "Groepeer items in die regte kategorieë." },
  { slug: "speed-quiz", title: "Spoedvasvra", description: "Getimede vrae vir hersiening onder druk." },
] as const;

export type ActivitySlug = (typeof activityTypes)[number]["slug"];

export function isActivitySlug(value: string): value is ActivitySlug {
  return activityTypes.some((activity) => activity.slug === value);
}

export const adminNav = [
  { href: "/admin", label: "Oorsig" },
  { href: "/admin/themes", label: "Temas" },
  { href: "/admin/products", label: "Produkte" },
  { href: "/admin/videos", label: "Video's" },
  { href: "/admin/weekly-facts", label: "Weeklikse feite" },
  { href: "/admin/activities", label: "Aktiwiteite" },
  { href: "/admin/live-chat", label: "Lewendige klets" },
  { href: "/admin/comments", label: "Kommentaar" },
  { href: "/admin/enquiries", label: "Navrae" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Instellings" },
] as const;

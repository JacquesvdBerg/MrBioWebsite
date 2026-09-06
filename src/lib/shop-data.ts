import type { VisualTone } from "@/components/visual";

// Placeholder catalogue until products are managed from the admin panel.

export type Product = {
  slug: string;
  grade: number;
  kind: string;
  title: string;
  price: number;
  bullets: string[];
  tone: VisualTone;
  badge?: string;
  pages?: number;
};

export const products: Product[] = [
  {
    slug: "gr11-bloedsomloop",
    grade: 11,
    kind: "Volledige pak",
    title: "Menslike bloedsomloopstelsel",
    price: 120,
    bullets: ["32 bladsye notas", "12 gemerkte diagramme", "Oefenvrae en memorandum"],
    tone: "orange",
    badge: "Gunsteling",
    pages: 32,
  },
  {
    slug: "gr12-dna",
    grade: 12,
    kind: "Eksamenpak",
    title: "DNA, RNA en proteïensintese",
    price: 150,
    bullets: ["Opsommings per subafdeling", "40 vorige eksamenvrae", "Volledige memorandum"],
    tone: "green",
    badge: "Nuut",
    pages: 48,
  },
  {
    slug: "gr10-selle",
    grade: 10,
    kind: "Werkkaarte",
    title: "Selle, organelle en selverdeling",
    price: 80,
    bullets: ["8 werkkaarte", "Mitose-volgorde kaarte", "Antwoorde ingesluit"],
    tone: "teal",
    pages: 20,
  },
  {
    slug: "gr11-fotosintese",
    grade: 11,
    kind: "Notas",
    title: "Fotosintese en selrespirasie",
    price: 80,
    bullets: ["22 bladsye", "Stap-vir-stap diagramme", "Oefenvrae en memorandum"],
    tone: "green",
    pages: 22,
  },
  {
    slug: "gr10-ekologie",
    grade: 10,
    kind: "Notas",
    title: "Ekosisteme en voedselwebbe",
    price: 70,
    bullets: ["18 bladsye", "Kleurdiagramme", "Woordelys Afrikaans–Engels"],
    tone: "blue",
    pages: 18,
  },
  {
    slug: "gr12-evolusie",
    grade: 12,
    kind: "Opsomming",
    title: "Evolusie: van Darwin tot DNA",
    price: 90,
    bullets: ["Een-bladsy opsommings", "Tydlyn-plakkaat", "Eksamenwenke"],
    tone: "purple",
    pages: 24,
  },
];

export const bundles = [
  {
    title: "Graad 12 volledige jaar",
    body: "Al die notas, werkkaarte en eksamenpakke vir graad 12 in een bundel. Stoor 30%.",
    price: 450,
    was: 640,
  },
  {
    title: "Klas-lisensie",
    body: "Druk vir jou hele klas. Sluit ’n onderwysergids en memorandums in.",
    price: 1200,
    was: null,
  },
];

export const featuredProducts = products.slice(0, 3);

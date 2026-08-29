export const themeCardSlots = [0, 1, 2] as const;

export type ThemeCardContent = {
  title: string;
  body: string;
  href: string;
  image: string;
};

export type ThemePageContent = {
  kicker: string;
  introHeading: string;
  introBody: string;
  outcomes: string[];
  featuredEyebrow: string;
  featuredTitle: string;
  featuredBody: string;
  featuredVideoUrl: string;
  featuredImage: string;
  cards: ThemeCardContent[];
  noteEyebrow: string;
  noteBody: string;
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};

const emptyCard: ThemeCardContent = {
  title: "",
  body: "",
  href: "",
  image: "",
};

export function defaultThemePage(theme: {
  title: string;
  blurb: string;
}): ThemePageContent {
  return {
    kicker: "Lewenswetenskappe",
    introHeading: `Oor ${theme.title}`,
    introBody: theme.blurb,
    outcomes: [
      "Verstaan die kernbegrippe van die tema",
      "Gebruik die regte vakterminologie",
      "Pas dit toe in diagramme, feite en vrae",
    ],
    featuredEyebrow: "Uitgeligte les",
    featuredTitle: "",
    featuredBody: "",
    featuredVideoUrl: "",
    featuredImage: "",
    cards: [
      {
        title: "Videolesse",
        body: "Kyk die lesse wat by hierdie tema aansluit.",
        href: "/video-lessons",
        image: "",
      },
      {
        title: "Weeklikse feite",
        body: "Lees interessanthede om die inhoud vas te maak.",
        href: "/weekly-facts",
        image: "",
      },
      {
        title: "Aktiwiteite",
        body: "Toets jouself met vasvrae en speletjies.",
        href: "/play-and-learn",
        image: "",
      },
    ],
    noteEyebrow: "Onthou",
    noteBody: "",
    ctaHeading: "Reg om te begin?",
    ctaBody: "Kies ’n les of aktiwiteit en werk op jou eie tempo.",
    ctaLabel: "Sien die lesse",
    ctaHref: "/video-lessons",
  };
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asCard(value: unknown): ThemeCardContent {
  if (!value || typeof value !== "object") {
    return { ...emptyCard };
  }

  const card = value as Record<string, unknown>;
  return {
    title: asString(card.title),
    body: asString(card.body),
    href: asString(card.href),
    image: asString(card.image),
  };
}

export function parseThemePage(
  value: unknown,
  theme: { title: string; blurb: string },
): ThemePageContent {
  const fallback = defaultThemePage(theme);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const raw = value as Record<string, unknown>;
  const rawCards = Array.isArray(raw.cards) ? raw.cards : [];
  const rawOutcomes = Array.isArray(raw.outcomes)
    ? raw.outcomes.filter((item): item is string => typeof item === "string")
    : fallback.outcomes;

  return {
    kicker: asString(raw.kicker, fallback.kicker),
    introHeading: asString(raw.introHeading, fallback.introHeading),
    introBody: asString(raw.introBody, fallback.introBody),
    outcomes: rawOutcomes.map((item) => item.trim()).filter(Boolean),
    featuredEyebrow: asString(raw.featuredEyebrow, fallback.featuredEyebrow),
    featuredTitle: asString(raw.featuredTitle),
    featuredBody: asString(raw.featuredBody),
    featuredVideoUrl: asString(raw.featuredVideoUrl),
    featuredImage: asString(raw.featuredImage),
    cards: themeCardSlots.map(
      (index) => rawCards[index] ? asCard(rawCards[index]) : fallback.cards[index] ?? { ...emptyCard },
    ),
    noteEyebrow: asString(raw.noteEyebrow, fallback.noteEyebrow),
    noteBody: asString(raw.noteBody),
    ctaHeading: asString(raw.ctaHeading, fallback.ctaHeading),
    ctaBody: asString(raw.ctaBody, fallback.ctaBody),
    ctaLabel: asString(raw.ctaLabel, fallback.ctaLabel),
    ctaHref: asString(raw.ctaHref, fallback.ctaHref),
  };
}

export function themePageFromForm(
  formData: FormData,
  theme: { title: string; blurb: string },
): ThemePageContent {
  const fallback = defaultThemePage(theme);

  return {
    kicker: String(formData.get("kicker") ?? fallback.kicker).trim(),
    introHeading: String(formData.get("introHeading") ?? "").trim(),
    introBody: String(formData.get("introBody") ?? "").trim(),
    outcomes: String(formData.get("outcomes") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    featuredEyebrow: String(formData.get("featuredEyebrow") ?? "").trim(),
    featuredTitle: String(formData.get("featuredTitle") ?? "").trim(),
    featuredBody: String(formData.get("featuredBody") ?? "").trim(),
    featuredVideoUrl: String(formData.get("featuredVideoUrl") ?? "").trim(),
    featuredImage: String(formData.get("featuredImage") ?? "").trim(),
    cards: themeCardSlots.map((index) => ({
      title: String(formData.get(`card_${index}_title`) ?? "").trim(),
      body: String(formData.get(`card_${index}_body`) ?? "").trim(),
      href: String(formData.get(`card_${index}_href`) ?? "").trim(),
      image: String(formData.get(`card_${index}_image`) ?? "").trim(),
    })),
    noteEyebrow: String(formData.get("noteEyebrow") ?? "").trim(),
    noteBody: String(formData.get("noteBody") ?? "").trim(),
    ctaHeading: String(formData.get("ctaHeading") ?? "").trim(),
    ctaBody: String(formData.get("ctaBody") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "").trim(),
  };
}

export function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\//, "").split("/")[0] || null;
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    const embed = parsed.pathname.match(/\/embed\/([^/]+)/);
    return embed?.[1] ?? null;
  } catch {
    return null;
  }
}

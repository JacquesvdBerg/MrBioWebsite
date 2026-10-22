import "server-only";
import { revalidatePath } from "next/cache";
import { formatAiTermsPrompt, getAiSettings, type AiSettings } from "@/lib/ai-settings";
import { johannesburgDate } from "@/lib/dates";
import { requestOpenAiJson } from "@/lib/openai-json";
import { grades } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { lifeScienceTopics } from "@/lib/syllabus";
import { weeklyFactCategories } from "@/lib/weekly-facts";

// Runs every Monday morning. A fact the teacher approved goes live first; with
// none waiting, OpenAI writes one for the grade whose turn it is this week.

type Category = (typeof weeklyFactCategories)[number];

const looks: Record<Category, { tone: string; art: string }> = {
  "Selle & weefsel": { tone: "teal", art: "cell" },
  Genetika: { tone: "green", art: "dna" },
  Plante: { tone: "green", art: "leaf" },
  "Menslike liggaam": { tone: "orange", art: "heart" },
  "Mikro-organismes": { tone: "purple", art: "microbe" },
  Ekologie: { tone: "teal", art: "leaf" },
  Senuweestelsel: { tone: "blue", art: "eye" },
  "Chemie van lewe": { tone: "blue", art: "molecule" },
};

export type WeeklyFactResult = {
  ok: boolean;
  weekStart: string;
  status: "published-queued" | "published-ai" | "preview" | "skipped" | "failed";
  slug?: string;
  grade?: number;
  reason?: string;
  /** Dry runs return the fact instead of saving it. */
  preview?: { title: string; body: string; category: string };
};

function mondayOf(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}

/** ISO week number, the same "Week 36 · 2026" the teacher used. */
function weekLabel(monday: string) {
  const thursday = new Date(`${monday}T00:00:00Z`);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { week, label: `Week ${week} · ${thursday.getUTCFullYear()}` };
}

function systemPrompt(settings: AiSettings) {
  const extra = settings.houseRules ? `\n\nEkstra huisreëls van die onderwyser:\n${settings.houseRules}` : "";

  return `Jy is ’n Lewenswetenskappe-onderwyser vir Suid-Afrikaanse leerders (CAPS) en skryf die "Feit van die week" vir MnrBio.

Harde reëls:
- Skryf in Afrikaans.
- Die feit moet waar en algemeen aanvaar wees, soos in ’n handboek of betroubare bron. Geen mites, sensasie of twyfelagtige getalle nie. As jy ’n getal gebruik, rond dit af en sê "omtrent".
- Kies iets wat verras en wat ’n leerder in die gegewe graad aan die werk in die klas kan koppel.
- Graad 8 en 9 volg Natuurwetenskappe: bly by Lewe en lewende dinge.
- Titel: een kort sin van hoogstens 90 karakters wat die feit self sê, byvoorbeeld "Al die DNA in een sel is omtrent 2 meter lank."
- Liggaam: twee of drie sinne, hoogstens 60 woorde, wat verduidelik waarom dit so is.
- Geen strepies as leestekens, geen emoji, geen uitroeptekens nie.
- Moenie ’n feit herhaal wat al gebruik is nie.
- Kies die kategorie wat die beste pas.
- Antwoord slegs met die gevraagde JSON.${formatAiTermsPrompt(settings.terms)}${extra}`;
}

function tidy(value: string) {
  return value.replace(/\s*[—–]\s*/g, ", ").replace(/\s+/g, " ").trim();
}

function revalidateFacts() {
  revalidatePath("/");
  revalidatePath("/weekly-facts");
  revalidatePath("/admin/weekly-facts");
  revalidatePath("/admin");
}

export async function runWeeklyFactJob(options: { date?: string; dryRun?: boolean } = {}): Promise<WeeklyFactResult> {
  const weekStart = mondayOf(options.date ?? johannesburgDate());
  const { week, label } = weekLabel(weekStart);
  const service = createServiceClient();

  if (!service) {
    return { ok: false, weekStart, status: "failed", reason: "SUPABASE_SERVICE_ROLE_KEY is missing" };
  }

  const { data: already } = await service
    .from("weekly_facts")
    .select("slug")
    .eq("status", "published")
    .eq("week_start", weekStart)
    .limit(1)
    .maybeSingle();

  if (already) {
    return { ok: true, weekStart, status: "skipped", slug: already.slug, reason: "This week already has a fact" };
  }

  const publish = { status: "published", published_at: new Date().toISOString(), week_start: weekStart, week_label: label };

  const { data: queued } = await service
    .from("weekly_facts")
    .select("slug, grade")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (queued && options.dryRun) {
    return { ok: true, weekStart, status: "preview", slug: queued.slug, reason: "Would publish this approved fact" };
  }

  if (queued) {
    const { error } = await service.from("weekly_facts").update(publish).eq("slug", queued.slug);
    if (error) {
      return { ok: false, weekStart, status: "failed", reason: error.message };
    }
    revalidateFacts();
    return { ok: true, weekStart, status: "published-queued", slug: queued.slug, grade: queued.grade };
  }

  const settings = await getAiSettings();
  if (settings.paused) {
    return { ok: true, weekStart, status: "skipped", reason: "Generation is paused in settings" };
  }

  const grade = grades[week % grades.length];
  const { data: recent } = await service
    .from("weekly_facts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(30);
  const used = (recent ?? []).map((row) => `- ${row.title}`).join("\n") || "- (nog geen)";
  const topics = lifeScienceTopics(grade).map((topic) => `- ${topic.title}`).join("\n");

  try {
    const fact = await requestOpenAiJson<{ title: string; body: string; category: Category }>({
      schemaName: "weekly_fact",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "category"],
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          category: { type: "string", enum: [...weeklyFactCategories] },
        },
      },
      system: systemPrompt(settings),
      user: `Graad: ${grade}\n${label}\n\nOnderwerpe vir hierdie graad:\n${topics}\n\nFeite wat al gebruik is (moenie herhaal nie):\n${used}\n\nSkryf die feit van die week.`,
    });

    const title = tidy(fact.title);
    let short = "";
    for (const word of slugify(title).split("-")) {
      if (`${short}-${word}`.length > 50) {
        break;
      }
      short = short ? `${short}-${word}` : word;
    }
    const slug = `${short || "feit"}-${weekStart}`;
    const look = looks[fact.category] ?? { tone: "green", art: "leaf" };

    if (options.dryRun) {
      return { ok: true, weekStart, status: "preview", grade, slug, preview: { title, body: tidy(fact.body), category: fact.category } };
    }

    const { error } = await service.from("weekly_facts").insert({
      slug,
      title,
      body: tidy(fact.body),
      category: fact.category,
      grade,
      tone: look.tone,
      art: look.art,
      sort_order: 0,
      ...publish,
    });

    if (error) {
      return { ok: false, weekStart, status: "failed", grade, reason: error.message };
    }

    revalidateFacts();
    return { ok: true, weekStart, status: "published-ai", slug, grade };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error("[weekly-fact] failed:", reason);
    return { ok: false, weekStart, status: "failed", grade, reason };
  }
}

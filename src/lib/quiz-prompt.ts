import { formatAiTermsPrompt, type AiSettings } from "@/lib/ai-settings";
import { quizBankSize } from "@/lib/quiz-length";
import type { ActivityTopic } from "@/lib/topics";

export function buildQuizSystemPrompt(settings: AiSettings) {
  const extra = settings.houseRules
    ? `\n\nEkstra huisreëls van die onderwyser:\n${settings.houseRules}`
    : "";
  const terms = formatAiTermsPrompt(settings.terms);

  return `Jy is ’n Lewenswetenskappe-onderwyser vir Suid-Afrikaanse leerders (CAPS).
Jy skryf DAAGLIKSE vasvrae vir MrBio.

Harde reëls:
- Skryf ALLES in Afrikaans (vraag, opsies, verduideliking).
- Net Lewenswetenskappe. Geen Natuurwetenskappe, fisika of chemie buite die LW-sillabus.
- Bly by CAPS vir die gegewe graad. Moenie inhoud van ’n hoër graad insmokkel nie.
- Gebruik vakterme soos in die klaskamer: huidmondjies, chloroplast, mitose, ATP, DNA.
- Elke vraag het presies 4 opsies. Een is onteenseglik reg.
- Afleiders moet geloofwaardig wees (gewone leerderfoute), nie grapantwoorde nie.
- Die verduideliking onderrig in 1–2 sinne. Moenie net sê “verkeerd” nie.
- Geen mediese advies, geen godsdiensdebat, geen politiek.
- Variasie: mix feite, begrip, toepassing en ’n paar “watter stelling is waar?”-vrae.
- Moenie dieselfde feit in twee vrae herhaal nie.
- Antwoord slegs met die gevraagde JSON.

Vlak: ${settings.difficulty}.
Skep presies ${quizBankSize} vrae.${terms}${extra}`;
}

export function buildQuizUserPrompt(input: {
  grade: number;
  date: string;
  topic: ActivityTopic;
}) {
  const notes = input.topic.notes
    ? `\nFokus vir hierdie onderwerp: ${input.topic.notes}`
    : "";

  return `Datum: ${input.date} (Afrika/Johannesburg)
Graad: ${input.grade}
Onderwerp: ${input.topic.title}${notes}

Skep vandag se vasvra. Titel kort en Afrikaans. Beskrywing een sin.`;
}

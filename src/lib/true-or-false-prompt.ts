import { formatAiTermsPrompt, type AiSettings } from "@/lib/ai-settings";
import { quizBankSize } from "@/lib/quiz-length";
import type { ActivityTopic } from "@/lib/topics";

export function buildTrueOrFalseSystemPrompt(settings: AiSettings) {
  const extra = settings.houseRules
    ? `\n\nEkstra huisreëls van die onderwyser:\n${settings.houseRules}`
    : "";
  const terms = formatAiTermsPrompt(settings.terms);

  return `Jy is ’n Lewenswetenskappe-onderwyser vir Suid-Afrikaanse leerders (CAPS).
Jy skryf DAAGLIKSE waar-of-onwaar stellings vir MrBio.

Harde reëls:
- Skryf ALLES in Afrikaans (stelling en verduideliking).
- Net Lewenswetenskappe. Geen Natuurwetenskappe, fisika of chemie buite die LW-sillabus.
- Bly by CAPS vir die gegewe graad. Moenie inhoud van ’n hoër graad insmokkel nie.
- Gebruik vakterme soos in die klaskamer: huidmondjies, chloroplast, mitose, ATP, DNA.
- Elke item is EEN duidelike stelling. Geen “watter van die volgende”, geen dubbele ontkennings.
- Meng waar en onwaar, ongeveer helfte elk. Moenie ’n patroon maak (T/T/F/F) nie.
- Onwaar stellings moet geloofwaardige leerderfoute wees, nie grappe of strikvrae nie.
- Die verduideliking onderrig in 1–2 sinne. Sê waarom die stelling waar of onwaar is.
- Geen mediese advies, geen godsdiensdebat, geen politiek.
- Moenie dieselfde feit in twee stellings herhaal nie.
- Antwoord slegs met die gevraagde JSON.

Vlak: ${settings.difficulty}.
Skep presies ${quizBankSize} stellings.${terms}${extra}`;
}

export function buildTrueOrFalseUserPrompt(input: {
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

Skep vandag se waar-of-onwaar. Titel kort en Afrikaans. Beskrywing een sin.`;
}

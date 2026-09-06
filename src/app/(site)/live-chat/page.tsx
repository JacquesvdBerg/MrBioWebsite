import { Field, FormNote, TextArea, TextInput } from "@/components/field";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow } from "@/components/ui";

export const metadata = {
  title: "Vra die onderwyser",
  description:
    "Stuur jou Lewenswetenskappe-vraag direk aan die MrBio-onderwyser en kry ’n antwoord.",
};

const conversation = [
  {
    from: "them",
    text: "Hallo! Ek is Mnr. Bio. Vra gerus — geen vraag is te klein nie.",
  },
  {
    from: "me",
    text: "Hoekom het arteries dikker wande as vene?",
  },
  {
    from: "them",
    text: "Goeie vraag. Bloed verlaat die hart onder hoë druk, so arteries het dik, elastiese spierwande om dit te hanteer. Vene dra bloed teen lae druk terug — hulle het dunner wande, ’n groter lumen en kleppe wat terugvloei stop.",
  },
  {
    from: "me",
    text: "So dis hoekom ek my pols net by arteries voel?",
  },
  {
    from: "them",
    text: "Presies. Die pols is die drukgolf van elke hartslag wat deur die arteriewande beweeg. Vene het nie so ’n golf nie.",
  },
];

const steps = [
  {
    title: "Stuur jou vraag",
    body: "Tik jou naam en jou vraag. Voeg by watter graad en onderwerp dit is as jy kan.",
  },
  {
    title: "Die onderwyser lees dit",
    body: "Vrae kom in die onderwyser se inkassie. Die meeste word binne ’n dag beantwoord.",
  },
  {
    title: "Jou gesprek bly bewaar",
    body: "Kom terug na hierdie bladsy op dieselfde toestel en jou gesprek is nog hier.",
  },
];

export default function LiveChatPage() {
  return (
    <SectionPage
      eyebrow="Vra die onderwyser"
      title={
        <>
          Vas met ’n vraag? <span className="gradient-text">Stuur dit.</span>
        </>
      }
      description="’n Regte Lewenswetenskappe-onderwyser antwoord. Geen robot, geen kopie-en-plak — net ’n duidelike verduideliking in Afrikaans."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/live-chat", label: "Vra die onderwyser" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Reveal>
          <div className="glass flex flex-col overflow-hidden rounded-[2rem]">
            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
              <span
                className="cell h-11 w-11"
                style={{
                  ["--cell-a" as string]: "#b8f542",
                  ["--cell-b" as string]: "#1f6b33",
                }}
              />
              <div>
                <p className="font-display text-lg font-bold text-white">Mnr. Bio</p>
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <span className="pulse-dot" />
                  Antwoord gewoonlik binne 24 uur
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 px-5 py-6 md:px-6">
              {conversation.map((message, index) => (
                <Reveal key={index} delay={index * 120}>
                  <div
                    className={`chat-bubble ${
                      message.from === "me" ? "chat-bubble-me" : "chat-bubble-them"
                    }`}
                  >
                    {message.text}
                  </div>
                </Reveal>
              ))}
              <p className="mt-2 text-center text-xs text-white/35">
                Voorbeeldgesprek. Jou eie gesprek verskyn hier sodra jy ’n vraag stuur.
              </p>
            </div>
            <div className="border-t border-white/8 p-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2">
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                  placeholder="Tik jou vraag hier…"
                  disabled
                  aria-label="Jou vraag"
                />
                <button
                  type="button"
                  disabled
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-on-accent opacity-70"
                  aria-label="Stuur"
                >
                  <Arrow className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <aside className="space-y-5">
          <Reveal delay={80}>
            <form className="glass space-y-5 rounded-[1.9rem] p-6 md:p-7">
              <div>
                <p className="eyebrow">Eerste vraag?</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                  Begin ’n gesprek
                </h2>
              </div>
              <Field label="Naam">
                <TextInput name="name" placeholder="Jou naam" />
              </Field>
              <Field label="Vraag" hint="Graad en onderwerp help">
                <TextArea
                  name="question"
                  placeholder="Graad 11 — hoekom het arteries dikker wande as vene?"
                  rows={4}
                />
              </Field>
              <button type="button" disabled className="btn btn-lime w-full">
                Stuur vraag
                <Arrow />
              </button>
              <FormNote>
                Die klets word gekoppel sodra die databasis gereed is.
              </FormNote>
            </form>
          </Reveal>

          <Reveal delay={140}>
            <div className="glass rounded-[1.9rem] p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                Hoe dit werk
              </p>
              <ol className="mt-4 space-y-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="number-badge shrink-0 !h-8 !w-8 text-sm">{index + 1}</span>
                    <div>
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/55">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </aside>
      </div>
    </SectionPage>
  );
}

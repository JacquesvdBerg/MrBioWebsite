import { Field, FormNote, Select, TextArea, TextInput } from "@/components/field";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Forum",
  description:
    "Stel onderwerpe voor, deel terugvoer en lees wat ander MrBio-leerders vra.",
};

const types = ["Voorstel", "Vraag", "Gedagte", "Lof", "Fout gevind"] as const;

const threads = [
  {
    name: "Lize · Gr. 12",
    type: "Voorstel",
    time: "2 dae gelede",
    body: "Kan ons asseblief ’n video oor die hormoonstelsel kry voor die September-toets? Veral die verskil tussen insulien en glukagon.",
    votes: 42,
    replies: 6,
    answered: true,
    accent: "#b8f542",
  },
  {
    name: "Sipho · Gr. 10",
    type: "Vraag",
    time: "3 dae gelede",
    body: "Hoekom het plantselle ’n selwand én ’n selmembraan? Wat doen die een wat die ander nie kan nie?",
    votes: 31,
    replies: 4,
    answered: true,
    accent: "#5ad1ff",
  },
  {
    name: "Mev. Botha · onderwyser",
    type: "Lof",
    time: "5 dae gelede",
    body: "Die kruiswoord van die dag werk ongelooflik goed as huiswerk. My graad 10’s vra nou self vir meer. Dankie!",
    votes: 58,
    replies: 2,
    answered: false,
    accent: "#ffc857",
  },
  {
    name: "Anoniem · Gr. 11",
    type: "Gedagte",
    time: "1 week gelede",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    votes: 12,
    replies: 1,
    answered: false,
    accent: "#9d8cff",
  },
];

const trending = [
  "Hormoonstelsel-video",
  "Meiose vs mitose",
  "Meer diagram-oefeninge",
  "Graad 12 eksamen-aftelling",
  "Engelse woordelys",
];

export default function CommentsPage() {
  return (
    <SectionPage
      eyebrow="Forum"
      title={
        <>
          Sê wat jy <span className="gradient-text">volgende wil leer.</span>
        </>
      }
      description="Stel ’n onderwerp voor, vra ’n vraag of sê net dankie. Alles word eers deur die onderwyser gekeur voordat dit hier verskyn — so dit bly veilig en nuttig."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/comments", label: "Forum" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section>
          <SectionHeading
            eyebrow="Goedgekeur"
            title="Onlangse plasings"
            action={
              <div className="flex gap-2">
                <span className="chip is-active">Nuutste</span>
                <span className="chip">Populêr</span>
              </div>
            }
          />
          <div className="space-y-4">
            {threads.map((thread, index) => (
              <Reveal key={thread.body} delay={index * 60}>
                <article className="glass rounded-[1.75rem] p-6 transition-colors hover:border-white/25">
                  <div className="flex items-start gap-4">
                    <span
                      className="cell h-11 w-11 shrink-0"
                      style={{
                        ["--cell-a" as string]: thread.accent,
                        ["--cell-b" as string]: "#10203a",
                        ["--cell-glow" as string]: "transparent",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-bold text-white">{thread.name}</span>
                        <span className="chip !py-0.5 !text-[11px]">{thread.type}</span>
                        <span className="text-white/40">{thread.time}</span>
                        {thread.answered ? (
                          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-lime">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                            Mnr. het geantwoord
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 leading-7 text-white/75">{thread.body}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
                        <span className="inline-flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          </svg>
                          {thread.votes}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M4 6h16v10H8l-4 4V6Z" />
                          </svg>
                          {thread.replies} antwoorde
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <form className="glass space-y-5 rounded-[1.9rem] p-6 md:p-7">
              <div>
                <p className="eyebrow">Plaas iets</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                  Nuwe plasing
                </h2>
              </div>
              <Field label="Naam" hint="Of skuilnaam">
                <TextInput name="name" placeholder="Jou naam" />
              </Field>
              <Field label="Tipe">
                <Select name="type" options={types} />
              </Field>
              <Field label="Boodskap">
                <TextArea
                  name="message"
                  placeholder="Kan Mnr. asseblief ’n video oor die hormoonstelsel maak?"
                />
              </Field>
              <button type="button" disabled className="btn btn-lime w-full">
                Stuur vir goedkeuring
                <Arrow />
              </button>
              <FormNote>
                Plasings word gekeur voordat dit publiek verskyn. Die forum word
                binnekort gekoppel.
              </FormNote>
            </form>
          </Reveal>

          <Reveal delay={80}>
            <div className="glass rounded-[1.9rem] p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                Gewild hierdie week
              </p>
              <ol className="mt-4 space-y-3">
                {trending.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/75">
                    <span className="font-display text-lg font-extrabold text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="rounded-[1.9rem] border border-lime/25 bg-lime/8 p-6">
              <p className="font-display text-lg font-bold text-white">Forumreëls</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
                <li>Wees vriendelik. Ons is almal hier om te leer.</li>
                <li>Geen persoonlike inligting nie — net ’n voornaam.</li>
                <li>Vrae oor die werk is welkom. Toetsantwoorde word nie gedeel nie.</li>
              </ul>
            </div>
          </Reveal>
        </aside>
      </div>
    </SectionPage>
  );
}

import { submitComment } from "@/app/(site)/actions";
import { Field, FormNote, Select, TextArea, TextInput } from "@/components/field";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, SectionHeading } from "@/components/ui";
import {
  commentAccent,
  commentAuthorLine,
  commentKinds,
  getApprovedComments,
} from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";
import { grades } from "@/lib/site";

export const metadata = {
  title: "Forum",
  description:
    "Stel onderwerpe voor, deel terugvoer en lees wat ander MrBio-leerders vra.",
};

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ gestuur?: string; fout?: string }>;
};

export default async function CommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const comments = await getApprovedComments();
  const trending = [...commentKinds]
    .map((kind) => ({
      kind,
      count: comments.filter((comment) => comment.kind === kind).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
          />
          {comments.length === 0 ? (
            <div className="glass rounded-[1.75rem] px-6 py-10 text-center">
              <p className="font-display text-xl font-bold text-white">Nog geen goedgekeurde plasings nie</p>
              <p className="mt-2 text-sm text-white/55">
                Stuur die eerste een — dit verskyn hier ná keuring.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <Reveal key={comment.id} delay={index * 60}>
                  <article className="glass rounded-[1.75rem] p-6 transition-colors hover:border-white/25">
                    <div className="flex items-start gap-4">
                      <span
                        className="cell h-11 w-11 shrink-0"
                        style={{
                          ["--cell-a" as string]: commentAccent(comment.kind),
                          ["--cell-b" as string]: "#10203a",
                          ["--cell-glow" as string]: "transparent",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="font-bold text-white">{commentAuthorLine(comment)}</span>
                          <span className="chip !py-0.5 !text-[11px]">{comment.kind}</span>
                          <span className="text-white/40">{formatRelativeAf(comment.createdAt)}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap leading-7 text-white/75">{comment.body}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <form action={submitComment} className="glass space-y-5 rounded-[1.9rem] p-6 md:p-7">
              <div>
                <p className="eyebrow">Plaas iets</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                  Nuwe plasing
                </h2>
              </div>
              {params.gestuur === "1" ? (
                <p className="text-sm text-lime">Dankie. Jou plasing wag op keuring.</p>
              ) : null}
              {params.fout === "leeg" ? (
                <p className="text-sm text-orange">Sit ’n naam en boodskap in.</p>
              ) : null}
              {params.fout === "stoor" ? (
                <p className="text-sm text-orange">Kon nie stoor nie. Probeer weer.</p>
              ) : null}
              <Field label="Naam" hint="Of skuilnaam">
                <TextInput name="name" placeholder="Jou naam" disabled={false} required />
              </Field>
              <Field label="Tipe">
                <Select name="type" options={commentKinds} disabled={false} />
              </Field>
              <Field label="Graad" hint="Opsioneel">
                <select className="input-dark" name="grade" defaultValue="">
                  <option value="">—</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Graad {grade}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Boodskap">
                <TextArea
                  name="message"
                  placeholder="Kan Mnr. asseblief ’n video oor die hormoonstelsel maak?"
                  disabled={false}
                  required
                />
              </Field>
              <button type="submit" className="btn btn-lime w-full">
                Stuur vir goedkeuring
                <Arrow />
              </button>
              <FormNote>
                Plasings word gekeur voordat dit publiek verskyn. Geen toetsantwoorde nie.
              </FormNote>
            </form>
          </Reveal>

          {trending.length > 0 ? (
            <Reveal delay={80}>
              <div className="glass rounded-[1.9rem] p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                  Gewild hierdie week
                </p>
                <ol className="mt-4 space-y-3">
                  {trending.map((item, index) => (
                    <li key={item.kind} className="flex items-center gap-3 text-sm text-white/75">
                      <span className="font-display text-lg font-extrabold text-white/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.kind}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ) : null}

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

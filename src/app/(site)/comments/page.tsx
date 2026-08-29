import { Field, FormNote, Select, TextArea, TextInput } from "@/components/field";
import { SectionPage } from "@/components/section-page";

export const metadata = {
  title: "Kommentaar en voorstelle",
};

const types = ["Voorstel", "Gedagte", "Vraag", "Lof", "Boodskap"] as const;

export default function CommentsPage() {
  return (
    <SectionPage
      eyebrow="Kommentaar"
      title="Voorstelle en terugvoer"
      description="Nuwe kommentaar gaan eers na Hangende. Die onderwyser keur goed of keur af voordat iets publiek verskyn."
      visionPath="vision/public/comments-suggestions"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-surface space-y-5 p-7">
          <Field label="Naam">
            <TextInput name="name" placeholder="Jou naam" />
          </Field>
          <Field label="Tipe">
            <Select name="type" options={types} />
          </Field>
          <Field label="Boodskap">
            <TextArea
              name="message"
              placeholder="Kan Mnr asseblief 'n video oor die hormoonstelsel maak?"
            />
          </Field>
          <button
            type="button"
            disabled
            className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white opacity-60"
          >
            Stuur kommentaar
          </button>
          <FormNote>
            Alle kommentaar word eers gekeur voordat dit publiek verskyn.
          </FormNote>
        </form>

        <aside className="card-surface flex items-center justify-center border-dashed p-8 text-center text-muted">
          Goedgekeurde leerderkommentaar verskyn hier.
        </aside>
      </div>
    </SectionPage>
  );
}

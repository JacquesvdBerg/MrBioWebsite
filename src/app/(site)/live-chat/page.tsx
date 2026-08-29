import { Field, FormNote, TextArea, TextInput } from "@/components/field";
import { SectionPage } from "@/components/section-page";

export const metadata = {
  title: "Lewendige klets",
};

export default function LiveChatPage() {
  return (
    <SectionPage
      eyebrow="Lewendige klets"
      title="Hallo! Vra gerus jou vraag."
      description="Leerders stuur ’n naam en vraag. Gesprekke word gestoor sodat niks verdwyn as die bladsy herlaai word nie. Antwoorde gebeur in die admin-inkassie."
      visionPath="vision/public/live-chat"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="card-surface space-y-5 p-7">
          <Field label="Naam">
            <TextInput name="name" placeholder="Jou naam" />
          </Field>
          <Field label="Vraag">
            <TextArea
              name="question"
              placeholder="Hoekom het arteries dikker wande as vene?"
            />
          </Field>
          <button
            type="button"
            disabled
            className="rounded-full bg-green px-6 py-3 text-sm font-bold text-white opacity-60"
          >
            Stuur vraag
          </button>
          <FormNote>
            Die vorm word gekoppel sodra die databasis gereed is.
          </FormNote>
        </form>

        <aside className="card-surface border-dashed p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">
            Hoe dit werk
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <li>1. Stuur jou vraag met jou naam.</li>
            <li>2. Die onderwyser sien dit in die admin-inkassie.</li>
            <li>3. Jou gesprek bly gestoor op hierdie toestel.</li>
          </ul>
        </aside>
      </div>
    </SectionPage>
  );
}

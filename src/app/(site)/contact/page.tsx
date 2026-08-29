import { Field, FormNote, TextArea, TextInput } from "@/components/field";
import { SectionPage } from "@/components/section-page";

export const metadata = {
  title: "Kontak",
};

export default function ContactPage() {
  return (
    <SectionPage
      eyebrow="Kontak"
      title="Kom in aanraking"
      description="Ouer, onderwyser of leerder — stuur gerus ’n boodskap. Produknavrae loop later deur die winkel."
      visionPath="vision/public/contact"
    >
      <form className="card-surface max-w-xl space-y-5 p-7">
        <Field label="Naam">
          <TextInput name="name" placeholder="Jou naam" />
        </Field>
        <Field label="E-pos">
          <TextInput name="email" type="email" placeholder="jy@voorbeeld.co.za" />
        </Field>
        <Field label="Boodskap">
          <TextArea name="message" placeholder="Hoe kan ons help?" />
        </Field>
        <button
          type="button"
          disabled
          className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white opacity-60"
        >
          Stuur boodskap
        </button>
        <FormNote>Die vorm word gekoppel sodra die databasis gereed is.</FormNote>
      </form>
    </SectionPage>
  );
}

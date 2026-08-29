import { SectionPage } from "@/components/section-page";

export const metadata = {
  title: "Oor ons",
};

const pillars = [
  {
    title: "Sillabus eerste",
    body: "Elke les, feit en aktiwiteit sluit aan by die CAPS-inhoud vir graad 8 tot 12.",
  },
  {
    title: "Afrikaans as tuisteel",
    body: "Vaktaal en verduidelikings in Afrikaans, met die Engelse terme waar dit help.",
  },
  {
    title: "Leer deur te doen",
    body: "Video’s bou die begrip, aktiwiteite en vasvrae maak dit vas.",
  },
];

export default function AboutPage() {
  return (
    <SectionPage
      eyebrow="Oor ons"
      title="Lewenswetenskappe, nader aan leerders"
      description="Die finale handelsnaam is nog nie bevestig nie. Die platform self moet voel soos ’n moderne biologie-leerplek — nie ’n kinderagtige speelgoedwerf of ’n tradisionele skoolblad nie."
      visionPath="vision/public/about"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="lift card-surface p-7">
            <h2 className="font-display text-xl font-bold text-navy">
              {pillar.title}
            </h2>
            <p className="mt-2.5 leading-7 text-muted">{pillar.body}</p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

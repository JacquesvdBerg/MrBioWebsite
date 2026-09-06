import Link from "next/link";
import { Field, FormNote, Select, TextArea, TextInput } from "@/components/field";
import { MailIcon, YoutubeIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow } from "@/components/ui";

export const metadata = {
  title: "Kontak",
  description: "Kontak die MrBio-span — vir ouers, onderwysers, skole en leerders.",
};

const reasons = ["Algemene navraag", "Winkel / produk", "Skool of klasgebruik", "Fout op die werf", "Media"] as const;

const cards = [
  {
    title: "E-pos",
    body: "hallo@mrbio.co.za",
    note: "Ons antwoord binne twee werksdae.",
    icon: "mail" as const,
  },
  {
    title: "YouTube",
    body: "@MrBio",
    note: "Nuwe les elke week. Los ’n kommentaar.",
    icon: "youtube" as const,
  },
  {
    title: "Vir leerders",
    body: "Vra die onderwyser",
    note: "Vakvrae gaan direk na die kletsblad.",
    icon: "chat" as const,
    href: "/live-chat",
  },
];

export default function ContactPage() {
  return (
    <SectionPage
      eyebrow="Kontak"
      title={
        <>
          Kom ons <span className="gradient-text">gesels.</span>
        </>
      }
      description="Ouer, onderwyser, skool of leerder — stuur gerus ’n boodskap. Vir vakvrae is die kletsblad vinniger; vir alles anders is hierdie die plek."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/contact", label: "Kontak" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Reveal>
          <form className="glass space-y-6 rounded-[2rem] p-7 md:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Naam">
                <TextInput name="name" placeholder="Jou naam" />
              </Field>
              <Field label="E-pos">
                <TextInput name="email" type="email" placeholder="jy@voorbeeld.co.za" />
              </Field>
            </div>
            <Field label="Waaroor gaan dit?">
              <Select name="reason" options={reasons} />
            </Field>
            <Field label="Boodskap">
              <TextArea name="message" placeholder="Hoe kan ons help?" rows={6} />
            </Field>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" disabled className="btn btn-lime">
                Stuur boodskap
                <Arrow />
              </button>
              <FormNote>Die vorm word gekoppel sodra die databasis gereed is.</FormNote>
            </div>
          </form>
        </Reveal>

        <aside className="space-y-4">
          {cards.map((card, index) => {
            const inner = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime/12 text-lime">
                  {card.icon === "mail" ? (
                    <MailIcon className="h-5 w-5" />
                  ) : card.icon === "youtube" ? (
                    <YoutubeIcon className="h-5 w-5" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 6h16v10H8l-4 4V6Z" />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                    {card.title}
                  </span>
                  <span className="mt-1 block font-display text-lg font-bold text-white">
                    {card.body}
                  </span>
                  <span className="mt-1 block text-sm text-white/55">{card.note}</span>
                </span>
              </>
            );

            return (
              <Reveal key={card.title} delay={index * 70}>
                {card.href ? (
                  <Link href={card.href} className="glass flex gap-4 rounded-[1.6rem] p-5 transition-colors hover:border-white/25">
                    {inner}
                  </Link>
                ) : (
                  <div className="glass flex gap-4 rounded-[1.6rem] p-5">{inner}</div>
                )}
              </Reveal>
            );
          })}

          <Reveal delay={220}>
            <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-bg-4 to-bg-2 p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                Vir skole
              </p>
              <p className="mt-2 font-display text-lg font-bold text-white">
                Wil jy MrBio in jou klas gebruik?
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Ons help met klas-lisensies, groeppryse op hulpbronne en ’n kort
                opleidingsessie vir onderwysers.
              </p>
              <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                Sien klas-bundels
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </aside>
      </div>
    </SectionPage>
  );
}

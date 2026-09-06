import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { VideoLibrary, type LibraryVideo } from "@/components/video-library";
import { publicFileUrl } from "@/lib/assets";
import { gradeAccents, grades, isGrade } from "@/lib/site";
import { isSeniorGrade, syllabus } from "@/lib/syllabus";
import { youtubeId } from "@/lib/theme-page";
import { getPublishedVideos } from "@/lib/videos";

export const metadata = {
  title: "Videolesse",
  description:
    "Gratis Afrikaanse Lewenswetenskappe-videolesse vir graad 10 tot 12, georganiseer volgens graad en onderwerp.",
};

export const revalidate = 300;

const placeholderLessons: LibraryVideo[] = [
  {
    id: "ph-1",
    title: "Fotosintese stap vir stap",
    description: "Hoe plante lig, water en CO₂ in glukose en suurstof omskep.",
    grade: 10,
    topic: "Plante",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "6:12",
    placeholder: true,
  },
  {
    id: "ph-2",
    title: "Mitose in vyf minute",
    description: "Profase, metafase, anafase, telofase — en hoekom dit saak maak.",
    grade: 10,
    topic: "Selle",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "5:03",
    placeholder: true,
  },
  {
    id: "ph-3",
    title: "DNA: die kode van lewe",
    description: "Nukleotiede, basisparing en hoe DNA gekopieer word.",
    grade: 12,
    topic: "Genetika",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "8:40",
    placeholder: true,
  },
  {
    id: "ph-4",
    title: "Die hart en bloedsomloop",
    description: "Kamers, kleppe en die pad wat bloed deur jou liggaam loop.",
    grade: 11,
    topic: "Menslike liggaam",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "7:25",
    placeholder: true,
  },
  {
    id: "ph-5",
    title: "Voedselkettings en -webbe",
    description: "Produsente, verbruikers en die vloei van energie in ’n ekosisteem.",
    grade: 10,
    topic: "Ekologie",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "4:50",
    placeholder: true,
  },
  {
    id: "ph-6",
    title: "Selle onder die mikroskoop",
    description: "Selmembraan, kern en organelle — wat elkeen doen.",
    grade: 11,
    topic: "Selle",
    youtubeUrl: "#",
    youtubeId: null,
    thumbnail: null,
    duration: "6:58",
    placeholder: true,
  },
];

export default async function VideoLessonsPage() {
  const published = await getPublishedVideos();

  const videos: LibraryVideo[] = published
    .filter((video) => video.grade == null || isGrade(video.grade))
    .map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    grade: video.grade,
    topic: video.topic,
    youtubeUrl: video.youtubeUrl,
    youtubeId: youtubeId(video.youtubeUrl),
    thumbnail: video.thumbnailPath ? publicFileUrl(video.thumbnailPath) : null,
    duration: "Les",
    placeholder: false,
  }));

  const library = videos.length > 0 ? videos : placeholderLessons;
  const featured = library[0];
  const featuredId = featured?.youtubeId ?? null;

  return (
    <SectionPage
      eyebrow="Videolesse"
      title={
        <>
          Kort lesse. <span className="gradient-text">Groot begrip.</span>
        </>
      }
      description="Elke video verduidelik een idee in minder as tien minute, in Afrikaans, met die sillabus as gids. Kyk hier, lees die notas, en toets dan jouself met die bypassende oefening."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/video-lessons", label: "Video’s" },
      ]}
      actions={
        <>
          <ButtonLink href="#biblioteek" tone="lime">
            Blaai deur lesse
            <Arrow />
          </ButtonLink>
          <ButtonLink href="#leerpaaie" tone="ghost">
            YouTube-speellyste
          </ButtonLink>
        </>
      }
    >
      {featured ? (
        <Reveal>
          <section className="grid gap-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/4 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative aspect-video bg-bg-2">
              {featuredId ? (
                <iframe
                  title={featured.title}
                  src={`https://www.youtube.com/embed/${featuredId}`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_70%_20%,rgba(184,245,66,0.25),transparent_55%),linear-gradient(160deg,#1f6b33,#0a1428)]">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-on-accent shadow-[0_0_60px_rgba(184,245,66,0.5)]">
                    <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-7 md:p-9">
              <span className="eyebrow w-fit">Begin hier</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] text-white">
                {featured.title}
              </h2>
              <p className="mt-3 leading-7 text-white/60">{featured.description}</p>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 p-3">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wider text-white/40">Graad</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-white">{featured.grade ?? "Alle"}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 p-3">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wider text-white/40">Lengte</dt>
                  <dd className="mt-1 font-display text-lg font-bold text-white">{featured.duration}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 p-3">
                  <dt className="text-[11px] font-extrabold uppercase tracking-wider text-white/40">Tema</dt>
                  <dd className="mt-1 truncate font-display text-lg font-bold text-white">{featured.topic || "Algemeen"}</dd>
                </div>
              </dl>
              {!featured.placeholder ? (
                <ButtonLink href={featured.youtubeUrl} tone="lime" className="mt-6 w-fit" external>
                  Kyk op YouTube
                  <Arrow />
                </ButtonLink>
              ) : (
                <ButtonLink href="/play-and-learn" tone="lime" className="mt-6 w-fit">
                  Doen die bypassende vasvra
                  <Arrow />
                </ButtonLink>
              )}
            </div>
          </section>
        </Reveal>
      ) : null}

      <section id="biblioteek" className="mt-20 scroll-mt-28">
        <SectionHeading
          eyebrow="Biblioteek"
          title="Alle lesse"
          description="Filtreer op graad of onderwerp. Elke les skakel na die YouTube-video."
        />
        <VideoLibrary videos={library} />
      </section>

      <section id="leerpaaie" className="mt-20 scroll-mt-28">
        <SectionHeading
          eyebrow="Volgens graad"
          title="Leerpaaie en speellyste"
          description="Graad 10 tot 12 volg die KABV-jaarplan en het elk ’n volledige YouTube-speellys."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {grades.map((grade, index) => {
            const count = library.filter((video) => video.grade === grade).length;
            const path = isSeniorGrade(grade) ? syllabus[grade] : null;
            return (
              <Reveal key={grade} delay={index * 60}>
                <div
                  className="glass flex h-full flex-col rounded-[1.6rem] p-5"
                  style={{ ["--accent" as string]: gradeAccents[grade] }}
                >
                  <span className="font-display text-4xl font-extrabold tracking-[-0.05em]" style={{ color: gradeAccents[grade] }}>
                    {grade}
                  </span>
                  <span className="mt-2 font-display text-lg font-bold text-white">Graad {grade}</span>
                  <span className="mt-1 flex-1 text-sm leading-6 text-white/55">
                    {path?.summary}
                  </span>
                  <span className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                    {count > 0 ? `${count} ${count === 1 ? "les" : "lesse"} hier` : "Lesse op YouTube"}
                  </span>
                  {path ? (
                    <a
                      href={path.playlist}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-lime"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#ff0033]" fill="currentColor" aria-hidden>
                        <path d="M23 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.9 4.3 12 4.3 12 4.3s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2c.5-1.7.5-5.3.5-5.3ZM9.8 15.3V8.7l5.8 3.3-5.8 3.3Z" />
                      </svg>
                      Speellys
                      <Arrow className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </SectionPage>
  );
}

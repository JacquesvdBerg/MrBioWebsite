import { SectionPage } from "@/components/section-page";
import { Visual } from "@/components/visual";
import { grades } from "@/lib/site";
import { getPublishedVideos } from "@/lib/videos";

export const metadata = {
  title: "Videolesse",
};

export const revalidate = 300;

export default async function VideoLessonsPage() {
  const videos = await getPublishedVideos();

  return (
    <SectionPage
      eyebrow="Videolesse"
      title="Gratis lesse volgens graad en onderwerp"
      description="Die werf organiseer die leerpad. YouTube speel die video’s. Video’s is gratis; dokumente word in die winkel verkoop."
      visionPath="vision/public/video-lessons"
    >
      {videos.length > 0 ? (
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {videos.map((video) => (
            <article key={video.id} className="card-surface overflow-hidden">
              {video.thumbnailPath ? (
                <Visual
                  file={video.thumbnailPath}
                  alt={video.title}
                  ratio="16/9"
                  tone="green"
                />
              ) : null}
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">
                  {video.grade ? `Graad ${video.grade}` : "Les"}
                  {video.topic ? ` · ${video.topic}` : ""}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-navy">
                  {video.title}
                </h2>
                {video.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {video.description}
                  </p>
                ) : null}
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-green px-4 py-2 text-sm font-bold text-white"
                >
                  Kyk op YouTube
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grades.map((grade) => (
          <article key={grade} className="lift card-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream font-display text-lg font-bold text-green">
              {grade}
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy">
              Graad {grade}
            </h2>
            <p className="mt-2 leading-7 text-muted">
              {videos.some((video) => video.grade === grade)
                ? `${videos.filter((video) => video.grade === grade).length} les(se) hierbo.`
                : "Onderwerpe verskyn hier sodra video’s in admin bygevoeg is."}
            </p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

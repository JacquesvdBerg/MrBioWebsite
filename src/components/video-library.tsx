"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Arrow } from "@/components/ui";
import { grades } from "@/lib/site";

export type LibraryVideo = {
  id: string;
  title: string;
  description: string;
  grade: number | null;
  topic: string;
  youtubeUrl: string;
  youtubeId: string | null;
  thumbnail: string | null;
  duration: string;
  placeholder: boolean;
};

type VideoLibraryProps = {
  videos: LibraryVideo[];
};

function thumbFor(video: LibraryVideo) {
  if (video.thumbnail) {
    return video.thumbnail;
  }
  if (video.youtubeId) {
    return `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  }
  return null;
}

const toneByIndex = ["#1f6b33", "#16406e", "#4a2f78", "#0f6f6b", "#8a3b14"];

export function VideoLibrary({ videos }: VideoLibraryProps) {
  const [grade, setGrade] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const video of videos) {
      if (video.topic) {
        set.add(video.topic);
      }
    }
    return [...set];
  }, [videos]);

  const filtered = videos.filter(
    (video) =>
      (grade === null || video.grade === grade) &&
      (topic === null || video.topic === topic),
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`chip ${grade === null ? "is-active" : ""}`}
            onClick={() => setGrade(null)}
          >
            Alle grade
          </button>
          {grades.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${grade === item ? "is-active" : ""}`}
              onClick={() => setGrade(item)}
            >
              Graad {item}
            </button>
          ))}
        </div>
        {topics.length > 0 ? (
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            <button
              type="button"
              className={`chip shrink-0 ${topic === null ? "is-active" : ""}`}
              onClick={() => setTopic(null)}
            >
              Alle onderwerpe
            </button>
            {topics.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip shrink-0 ${topic === item ? "is-active" : ""}`}
                onClick={() => setTopic(item)}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-5 text-sm text-white/45">
        {filtered.length} {filtered.length === 1 ? "les" : "lesse"}
        {grade ? ` vir graad ${grade}` : ""}
        {topic ? ` oor ${topic}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="glass mt-6 rounded-[1.75rem] p-10 text-center">
          <p className="font-display text-2xl font-bold text-white">
            Nog geen lesse hier nie.
          </p>
          <p className="mt-2 text-white/55">
            Nuwe video’s word weekliks bygevoeg. Kies ’n ander graad of onderwerp.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video, index) => {
            const thumb = thumbFor(video);
            const content = (
              <>
                <div className="relative aspect-video overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 50%), linear-gradient(160deg, ${toneByIndex[index % toneByIndex.length]}, #0a1428)`,
                      }}
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-bg/70 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    {video.grade ? `Graad ${video.grade}` : "Alle grade"}
                  </span>
                  <span className="absolute bottom-4 right-4 rounded-full bg-bg/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {video.duration}
                  </span>
                  <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime text-on-accent shadow-[0_0_30px_rgba(184,245,66,0.5)] transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {video.topic ? (
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                      {video.topic}
                    </span>
                  ) : null}
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-white">
                    {video.title}
                  </h3>
                  {video.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                      {video.description}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white/80">
                    {video.placeholder ? "Kom binnekort" : "Kyk op YouTube"}
                    {!video.placeholder ? <Arrow className="h-4 w-4" /> : null}
                  </span>
                </div>
              </>
            );

            const className =
              "group glass flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-colors hover:border-white/25";

            return (
              <Reveal key={video.id} delay={(index % 3) * 70}>
                {video.placeholder ? (
                  <article className={className}>{content}</article>
                ) : (
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createVideo, deleteVideo } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { DeleteButton } from "@/components/admin-client";
import { listMedia } from "@/lib/media";
import { youtubeId } from "@/lib/theme-page";
import { grades } from "@/lib/site";
import { getAllVideos } from "@/lib/videos";

export const metadata = {
  title: "Video's",
};

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const [videos, media] = await Promise.all([getAllVideos(), listMedia()]);

  return (
    <AdminPage
      title="Video’s"
      description="Voeg ’n YouTube-les by. Die duimnael kom uit Media — of laat YouTube se eie prent staan."
    >
      <AdminPanel title="Nuwe les" icon="plus" collapsible defaultOpen={videos.length === 0}>
        <form action={createVideo} className="grid gap-3 md:grid-cols-2">
          <label className="desk-label md:col-span-2">
            Titel
            <input className={deskField} name="title" required />
          </label>
          <label className="desk-label md:col-span-2">
            YouTube-skakel
            <input
              className={deskField}
              name="youtube_url"
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v="
            />
          </label>
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue="">
              <option value="">—</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Onderwerp
            <input className={deskField} name="topic" />
          </label>
          <label className="desk-label md:col-span-2">
            Beskrywing
            <textarea className={`${deskField} min-h-24`} name="description" />
          </label>
          <label className="desk-label">
            Duimnael-URL
            <input className={deskField} name="thumbnail_path" list="media-urls" />
          </label>
          <label className="desk-label">
            Volgorde
            <input
              className={deskField}
              name="sort_order"
              type="number"
              defaultValue={videos.length + 1}
            />
          </label>
          <label className="desk-check md:col-span-2">
            <input type="checkbox" name="is_published" defaultChecked />
            Publiseer
          </label>
          <div className="md:col-span-2">
            <AdminBtn type="submit" icon="plus">
              Voeg video by
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <datalist id="media-urls">
        {media.map((item) => (
          <option key={item.url} value={item.url}>
            {item.name}
          </option>
        ))}
      </datalist>

      <div className="mt-6">
        <AdminPanel title={`${videos.length} video’s`} icon="video">
          {videos.length === 0 ? (
            <AdminEmpty
              icon="video"
              title="Nog geen video’s nie"
              body="Plak Louis se les-skakel hierbo. Die publieke biblioteek lees dieselfde lys."
            />
          ) : (
            <ul>
              {videos.map((video) => {
                const id = youtubeId(video.youtubeUrl);
                const thumb = video.thumbnailPath || (id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null);

                return (
                  <li key={video.id} className="desk-row">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="desk-thumb"
                        aria-label={`Kyk ${video.title} op YouTube`}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" loading="lazy" />
                        ) : null}
                        <span className="desk-thumb-play" aria-hidden>
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </a>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display font-bold text-white">{video.title}</p>
                          <AdminBadge tone={video.isPublished ? "live" : "draft"}>
                            {video.isPublished ? "Live" : "Konsep"}
                          </AdminBadge>
                        </div>
                        <p className="text-sm text-white/55">
                          {video.grade ? `Graad ${video.grade}` : "Geen graad"}
                          {video.topic ? ` · ${video.topic}` : ""}
                        </p>
                      </div>
                    </div>
                    <form action={deleteVideo}>
                      <input type="hidden" name="id" value={video.id} />
                      <DeleteButton confirm="Verwyder hierdie video? Dit verdwyn ook van die publieke biblioteek." />
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}

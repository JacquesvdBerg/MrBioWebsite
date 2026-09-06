import { createVideo, deleteVideo } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { listMedia } from "@/lib/media";
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
      <AdminPanel title="Nuwe les">
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
            <AdminBtn type="submit">Voeg video by</AdminBtn>
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
        <AdminPanel title={`${videos.length} video’s`}>
          {videos.length === 0 ? (
            <AdminEmpty
              title="Nog geen video’s nie"
              body="Plak Louis se les-skakel hierbo. Die publieke biblioteek lees dieselfde lys."
            />
          ) : (
            <ul>
              {videos.map((video) => (
                <li key={video.id} className="desk-row">
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
                    <a
                      href={video.youtubeUrl}
                      className="mt-1 inline-block truncate text-sm text-lime"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {video.youtubeUrl}
                    </a>
                  </div>
                  <form action={deleteVideo}>
                    <input type="hidden" name="id" value={video.id} />
                    <button type="submit" className="desk-btn desk-btn-danger">
                      Verwyder
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}

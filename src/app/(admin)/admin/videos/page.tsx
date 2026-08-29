import { createVideo, deleteVideo } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { listMedia } from "@/lib/media";
import { grades } from "@/lib/site";
import { getAllVideos } from "@/lib/videos";

export const metadata = {
  title: "Video's",
};

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-cream/60 px-3 py-2 text-sm";

export default async function AdminVideosPage() {
  const [videos, media] = await Promise.all([getAllVideos(), listMedia()]);

  return (
    <AdminPage
      title="Video’s"
      description="Voeg 'n YouTube-les by. Prent-URL kom van Media."
    >
      <form
        action={createVideo}
        className="mb-8 grid gap-3 rounded-2xl border border-line bg-white p-5 md:grid-cols-2"
      >
        <label className="text-sm font-semibold md:col-span-2">
          Titel
          <input className={inputClass} name="title" required />
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          YouTube-skakel
          <input
            className={inputClass}
            name="youtube_url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v="
          />
        </label>
        <label className="text-sm font-semibold">
          Graad
          <select className={inputClass} name="grade" defaultValue="">
            <option value="">—</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Onderwerp
          <input className={inputClass} name="topic" />
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Beskrywing
          <textarea className={`${inputClass} min-h-24`} name="description" />
        </label>
        <label className="text-sm font-semibold">
          Duimnael-URL
          <input
            className={inputClass}
            name="thumbnail_path"
            list="media-urls"
          />
        </label>
        <label className="text-sm font-semibold">
          Volgorde
          <input
            className={inputClass}
            name="sort_order"
            type="number"
            defaultValue={videos.length + 1}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
          <input type="checkbox" name="is_published" defaultChecked />
          Publiseer
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-bold text-white"
        >
          Voeg video by
        </button>
      </form>

      <datalist id="media-urls">
        {media.map((item) => (
          <option key={item.url} value={item.url}>
            {item.name}
          </option>
        ))}
      </datalist>

      <ul className="grid gap-3">
        {videos.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            Nog geen video’s nie.
          </li>
        ) : (
          videos.map((video) => (
            <li
              key={video.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white p-4"
            >
              <div>
                <p className="font-display font-bold text-navy">{video.title}</p>
                <p className="text-sm text-muted">
                  {video.grade ? `Graad ${video.grade} · ` : ""}
                  {video.topic}
                </p>
                <a
                  href={video.youtubeUrl}
                  className="mt-1 inline-block text-sm text-green"
                  target="_blank"
                  rel="noreferrer"
                >
                  {video.youtubeUrl}
                </a>
              </div>
              <form action={deleteVideo}>
                <input type="hidden" name="id" value={video.id} />
                <button type="submit" className="text-xs font-semibold text-orange">
                  Verwyder
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </AdminPage>
  );
}

import Link from "next/link";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminStat,
} from "@/components/admin-ui";
import { getAllActivities } from "@/lib/activities";
import { activityKindLabel } from "@/lib/admin";
import { getAiSettings } from "@/lib/ai-settings";
import { listMedia } from "@/lib/media";
import { grades } from "@/lib/site";
import { getAllThemes } from "@/lib/themes";
import { getAllTopics } from "@/lib/topics";
import { getAllVideos } from "@/lib/videos";

export const metadata = {
  title: "Oorsig",
};

export const dynamic = "force-dynamic";

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 12) {
    return "Goeie môre";
  }
  if (hour < 17) {
    return "Goeie middag";
  }
  return "Goeie aand";
}

export default async function AdminDashboardPage() {
  const [videos, activities, themes, topics, media, settings] = await Promise.all([
    getAllVideos(),
    getAllActivities(),
    getAllThemes(),
    getAllTopics(),
    listMedia(),
    getAiSettings(),
  ]);

  const publishedVideos = videos.filter((video) => video.isPublished).length;
  const publishedActivities = activities.filter((activity) => activity.isPublished).length;
  const publishedThemes = themes.filter((theme) => theme.isPublished).length;
  const activeTopics = topics.filter((topic) => topic.isActive).length;
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("af-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today);

  return (
    <AdminPage
      title={`${greeting(today)}, MrBio`}
      description={`${todayLabel}. Hier sit die lessenaar — syfers, waglys, en die volgende ding om te doen.`}
      actions={
        <>
          <AdminBtn href="/admin/videos">Nuwe video</AdminBtn>
          <AdminBtn href="/admin/activities/quiz/new" tone="ghost">
            Nuwe vasvra
          </AdminBtn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          href="/admin/videos"
          label="Video’s"
          value={publishedVideos}
          hint={`${videos.length} in die bank`}
        />
        <AdminStat
          href="/admin/activities"
          label="Aktiwiteite"
          value={publishedActivities}
          hint={`${activities.length} totaal`}
        />
        <AdminStat
          href="/admin/themes"
          label="Temas"
          value={publishedThemes}
          hint={`${themes.length} op die lys`}
        />
        <AdminStat
          href="/admin/topics"
          label="Aktiewe onderwerpe"
          value={activeTopics}
          hint="Vir die nagtaak"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat href="/admin/media" label="Media" value={media.length} hint="Prente in Storage" />
        <AdminStat href="/admin/enquiries" label="Winkelnavrae" value={0} hint="Wag op koppeling" />
        <AdminStat href="/admin/live-chat" label="Ongeleesde klets" value={0} hint="Wag op koppeling" />
        <AdminStat href="/admin/comments" label="Kommentaar wag" value={0} hint="Wag op koppeling" />
      </div>

      {settings.paused ? (
        <div className="desk-soon mt-6">
          <p className="desk-soon-kicker">Nagtaak</p>
          <p className="mt-1 font-display text-lg font-bold text-white">Die daaglikse AI-jobs is gepouseer</p>
          <p className="mt-1 text-sm leading-6 text-white/55">
            Geen nuwe vasvrae of oefeninge word vannag gebou nie. Skakel dit weer aan onder Instellings.
          </p>
          <div className="mt-3">
            <AdminBtn href="/admin/settings" tone="ghost">
              Maak instellings oop
            </AdminBtn>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm text-white/55">
          Nagtaak is <strong className="text-white">aan</strong> · vlak{" "}
          <strong className="text-white">{settings.difficulty}</strong>.{" "}
          <Link href="/admin/settings" className="font-bold text-lime">
            Wysig huisreëls
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel title="Vinnige aksies">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/themes", label: "Nuwe tema", body: "Sillabus-bladsy uit die template." },
              { href: "/admin/videos", label: "Sit ’n les op", body: "YouTube-skakel, graad, onderwerp." },
              { href: "/admin/activities/quiz/new", label: "Skryf ’n vasvra", body: "Handmatig, een vraag op ’n slag." },
              { href: "/admin/products", label: "Notas & pryse", body: "Wat in ’n pak sit, besluit jy hier." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:border-white/20 hover:bg-white/8"
              >
                <p className="font-display font-bold text-white">{item.label}</p>
                <p className="mt-1 text-sm text-white/55">{item.body}</p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Per graad">
          <ul>
            {grades.map((grade) => {
              const gradeVideos = videos.filter((video) => video.grade === grade).length;
              const gradeActivities = activities.filter((activity) => activity.grade === grade).length;
              const gradeTopics = topics.filter((topic) => topic.grade === grade).length;

              return (
                <li key={grade} className="desk-row">
                  <div>
                    <p className="font-display text-lg font-bold text-white">Graad {grade}</p>
                    <p className="text-sm text-white/55">
                      {gradeVideos} video’s · {gradeActivities} aktiwiteite · {gradeTopics} onderwerpe
                    </p>
                  </div>
                  <AdminBtn href={`/admin/videos`} tone="ghost">
                    Video’s
                  </AdminBtn>
                </li>
              );
            })}
          </ul>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel
          title="Onlangse video’s"
          action={
            <Link href="/admin/videos" className="text-sm font-bold text-lime">
              Alles
            </Link>
          }
        >
          {videos.length === 0 ? (
            <AdminEmpty
              title="Nog geen lesse nie"
              body="Plak ’n YouTube-skakel en die klas kan dadelik kyk."
              action={<AdminBtn href="/admin/videos">Voeg die eerste video by</AdminBtn>}
            />
          ) : (
            <ul>
              {videos.slice(0, 5).map((video) => (
                <li key={video.id} className="desk-row">
                  <div>
                    <p className="font-display font-bold text-white">{video.title}</p>
                    <p className="text-sm text-white/55">
                      {video.grade ? `Graad ${video.grade}` : "Geen graad"}
                      {video.topic ? ` · ${video.topic}` : ""}
                    </p>
                  </div>
                  <AdminBadge tone={video.isPublished ? "live" : "draft"}>
                    {video.isPublished ? "Live" : "Konsep"}
                  </AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel
          title="Onlangse aktiwiteite"
          action={
            <Link href="/admin/activities" className="text-sm font-bold text-lime">
              Alles
            </Link>
          }
        >
          {activities.length === 0 ? (
            <AdminEmpty
              title="Die oefenbank is leeg"
              body="Skryf een vasvra, of laat die nagtaak die eerste een bou."
              action={<AdminBtn href="/admin/activities/quiz/new">Nuwe vasvra</AdminBtn>}
            />
          ) : (
            <ul>
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="desk-row">
                  <div>
                    <p className="font-display font-bold text-white">{activity.title}</p>
                    <p className="text-sm text-white/55">
                      {activityKindLabel(activity.kind)}
                      {activity.grade ? ` · Graad ${activity.grade}` : ""}
                    </p>
                  </div>
                  <AdminBadge tone={activity.isPublished ? "live" : "draft"}>
                    {activity.isPublished ? "Live" : "Konsep"}
                  </AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}

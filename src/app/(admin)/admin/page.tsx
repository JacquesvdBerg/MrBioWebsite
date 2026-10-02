import Image from "next/image";
import Link from "next/link";
import { AdminIcon } from "@/components/admin-icon";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminStat,
  type DeskTone,
} from "@/components/admin-ui";
import { getAllActivities } from "@/lib/activities";
import { activityKindLabel, adminQuickActions, type AdminIconName } from "@/lib/admin";
import { getAiSettings } from "@/lib/ai-settings";
import { getSessionAccount } from "@/lib/auth-role";
import { countCommentsByStatus } from "@/lib/comments";
import { countEnquiriesByStatus } from "@/lib/enquiries";
import { countUnreadChatThreads } from "@/lib/live-chat";
import { getAllProducts } from "@/lib/products";
import { gradeColors, grades } from "@/lib/site";
import { getAllTopics } from "@/lib/topics";
import { getAllVideos } from "@/lib/videos";
import { getAllWeeklyFacts } from "@/lib/weekly-facts";

export const metadata = {
  title: "Oorsig",
};

export const dynamic = "force-dynamic";

function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Johannesburg" }).format(now),
  );
  if (hour < 12) {
    return "Goeie môre";
  }
  if (hour < 17) {
    return "Goeie middag";
  }
  return "Goeie aand";
}

function share(part: number, whole: number) {
  return whole > 0 ? part / whole : 0;
}

const quickTones: DeskTone[] = ["green", "teal", "violet", "blue", "amber", "coral"];

export default async function AdminDashboardPage() {
  const [account, videos, activities, topics, facts, products, settings, newEnquiries, unreadChat, pendingComments] =
    await Promise.all([
      getSessionAccount(),
      getAllVideos(),
      getAllActivities(),
      getAllTopics(),
      getAllWeeklyFacts(),
      getAllProducts(),
      getAiSettings(),
      countEnquiriesByStatus("new"),
      countUnreadChatThreads(),
      countCommentsByStatus("pending"),
    ]);

  const liveVideos = videos.filter((video) => video.isPublished).length;
  const liveActivities = activities.filter((activity) => activity.isPublished).length;
  const liveFacts = facts.filter((fact) => fact.status === "published");
  const factsToReview = facts.filter((fact) => fact.status !== "published").length;
  const liveProducts = products.filter((product) => product.isPublished).length;
  const activeTopics = topics.filter((topic) => topic.isActive).length;
  const currentFact = liveFacts[0] ?? null;

  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat("af-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Johannesburg",
  }).format(now);
  const name = account?.name ?? "Mnr. Bio";

  const attention: {
    href: string;
    label: string;
    count: number;
    hot: string;
    calm: string;
    icon: AdminIconName;
    tone: DeskTone;
  }[] = [
    {
      href: "/admin/live-chat",
      label: "Klets",
      count: unreadChat,
      hot: "Leerders wag op ’n antwoord",
      calm: "Alles beantwoord",
      icon: "chat",
      tone: "blue",
    },
    {
      href: "/admin/comments",
      label: "Kommentaar",
      count: pendingComments,
      hot: "Wag om gekeur te word",
      calm: "Die waglys is skoon",
      icon: "comment",
      tone: "violet",
    },
    {
      href: "/admin/enquiries",
      label: "Navrae",
      count: newEnquiries,
      hot: "Nuwe winkelnavrae",
      calm: "Geen nuwe navrae nie",
      icon: "inbox",
      tone: "amber",
    },
    {
      href: "/admin/weekly-facts",
      label: "Feite",
      count: factsToReview,
      hot: "Konsepte om te hersien",
      calm: "Niks in konsep nie",
      icon: "leaf",
      tone: "teal",
    },
  ];
  const waiting = attention.reduce((sum, item) => sum + item.count, 0);

  const coverage = grades.map((grade) => ({
    grade,
    videos: videos.filter((video) => video.grade === grade).length,
    activities: activities.filter((activity) => activity.grade === grade).length,
    topics: topics.filter((topic) => topic.grade === grade).length,
  }));
  const most = {
    videos: Math.max(1, ...coverage.map((row) => row.videos)),
    activities: Math.max(1, ...coverage.map((row) => row.activities)),
    topics: Math.max(1, ...coverage.map((row) => row.topics)),
  };

  return (
    <div className="desk-page mx-auto w-full max-w-6xl">
      <section className="desk-welcome">
        <div className="relative z-10 max-w-xl">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-white/60">{todayLabel}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] md:text-[2.6rem] md:leading-[1.1]">
            {greeting(now)}, {name}
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-white/75">
            {waiting > 0
              ? `${waiting} ${waiting === 1 ? "ding wag" : "dinge wag"} op jou aandag.`
              : "Alles is op datum. Tyd vir iets nuuts?"}{" "}
            {settings.paused
              ? "Die nagtaak is gepouseer."
              : `Die oefenbank het ${liveActivities} live aktiwiteite.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <AdminBtn href="/admin/activities/quiz/new" icon="plus">
              Nuwe vasvra
            </AdminBtn>
            <AdminBtn href="/admin/weekly-facts" tone="ghost" icon="leaf">
              Nuwe feit
            </AdminBtn>
            <AdminBtn href="/" tone="ghost" icon="external" external>
              Bekyk die werf
            </AdminBtn>
          </div>
        </div>
        <Image
          src="/images/home/island/island.webp"
          alt=""
          width={1338}
          height={1492}
          sizes="248px"
          className="desk-welcome-art"
          priority
        />
      </section>

      <h2 className="desk-section-title">Wag op jou</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {attention.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`desk-attn is-${item.tone} ${item.count > 0 ? "is-hot" : ""}`}
          >
            <span className="desk-tile">
              <AdminIcon name={item.count > 0 ? item.icon : "check"} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                  {item.count}
                </span>
                <span className="font-bold text-white">{item.label}</span>
              </span>
              <span className="block text-sm leading-5 text-white/55">
                {item.count > 0 ? item.hot : item.calm}
              </span>
            </span>
            <span className="desk-attn-go">
              <AdminIcon name="arrow" className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="desk-section-title">Inhoud</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          href="/admin/videos"
          label="Video’s"
          value={liveVideos}
          hint={`${liveVideos} van ${videos.length} live`}
          icon="video"
          tone="blue"
          progress={share(liveVideos, videos.length)}
        />
        <AdminStat
          href="/admin/activities"
          label="Aktiwiteite"
          value={liveActivities}
          hint={`${liveActivities} van ${activities.length} live`}
          icon="puzzle"
          tone="green"
          progress={share(liveActivities, activities.length)}
        />
        <AdminStat
          href="/admin/weekly-facts"
          label="Weeklikse feite"
          value={liveFacts.length}
          hint={`${liveFacts.length} van ${facts.length} gepubliseer`}
          icon="leaf"
          tone="teal"
          progress={share(liveFacts.length, facts.length)}
        />
        <AdminStat
          href="/admin/products"
          label="Produkte"
          value={liveProducts}
          hint={`${liveProducts} van ${products.length} in die winkel`}
          icon="cart"
          tone="amber"
          progress={share(liveProducts, products.length)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <AdminPanel title="Dekking per graad" icon="list">
          <div className="mb-3 hidden grid-cols-[2.6rem_minmax(0,1fr)] gap-x-[0.9rem] sm:grid">
            <span />
            <span className="grid grid-cols-3 gap-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/45">
              <span>Video’s</span>
              <span>Aktiwiteite</span>
              <span>Onderwerpe</span>
            </span>
          </div>
          {coverage.map((row) => (
            <div key={row.grade} className="desk-grade-row">
              <span
                className="desk-grade-chip"
                style={{ ["--c1" as string]: gradeColors[row.grade][0], ["--c2" as string]: gradeColors[row.grade][1] }}
              >
                {row.grade}
              </span>
              <div className="desk-grade-bars">
                {(
                  [
                    ["videos", "Video’s", "is-blue"],
                    ["activities", "Aktiwiteite", "is-green"],
                    ["topics", "Onderwerpe", "is-violet"],
                  ] as const
                ).map(([key, label, tone]) => (
                  <div key={key} className={tone}>
                    <p className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-white/55 sm:hidden">{label}</span>
                      <span className="font-bold text-white">{row[key]}</span>
                    </p>
                    <span className="desk-meter" aria-hidden>
                      <span style={{ width: `${Math.round((row[key] / most[key]) * 100)}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </AdminPanel>

        <div className="grid content-start gap-6">
          <AdminPanel
            title="Nagtaak"
            icon="spark"
            action={
              <AdminBadge tone={settings.paused ? "wait" : "live"}>
                {settings.paused ? "Gepouseer" : "Aan"}
              </AdminBadge>
            }
          >
            <div className="desk-kv">
              <span className="text-white/55">Vlak</span>
              <span className="font-bold capitalize text-white">{settings.difficulty}</span>
            </div>
            <div className="desk-kv">
              <span className="text-white/55">Aktiewe onderwerpe</span>
              <span className="font-bold text-white">{activeTopics}</span>
            </div>
            <div className="desk-kv">
              <span className="text-white/55">Vakterme</span>
              <span className="font-bold text-white">{settings.terms.length}</span>
            </div>
            <div className="mt-4">
              <AdminBtn href="/admin/settings" tone="ghost" size="sm" icon="settings">
                Huisreëls
              </AdminBtn>
            </div>
          </AdminPanel>

          <AdminPanel title="Feit van die week" icon="leaf">
            {currentFact ? (
              <>
                <p className="font-display text-lg font-bold leading-snug text-white">{currentFact.title}</p>
                <p className="mt-1 text-sm text-white/55">
                  {currentFact.category || "Lewenswetenskappe"} · Graad {currentFact.grade}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/55">Nog niks gepubliseer nie.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <AdminBtn href="/admin/weekly-facts" tone="ghost" size="sm">
                {factsToReview > 0 ? `${factsToReview} in konsep` : "Alle feite"}
              </AdminBtn>
            </div>
          </AdminPanel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel
          title="Onlangse aktiwiteite"
          icon="puzzle"
          action={
            <Link href="/admin/activities" className="text-sm font-bold text-lime">
              Alles
            </Link>
          }
        >
          {activities.length === 0 ? (
            <AdminEmpty
              icon="puzzle"
              title="Die oefenbank is leeg"
              body="Skryf een vasvra, of laat die nagtaak die eerste een bou."
              action={<AdminBtn href="/admin/activities/quiz/new">Nuwe vasvra</AdminBtn>}
            />
          ) : (
            <ul>
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="desk-row">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-white">{activity.title}</p>
                    <p className="text-sm text-white/55">
                      {activityKindLabel(activity.kind)}
                      {activity.grade ? ` · Graad ${activity.grade}` : ""}
                      {activity.source === "ai-daily" ? " · Nagtaak" : ""}
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

        <AdminPanel
          title="Onlangse video’s"
          icon="video"
          action={
            <Link href="/admin/videos" className="text-sm font-bold text-lime">
              Alles
            </Link>
          }
        >
          {videos.length === 0 ? (
            <AdminEmpty
              icon="video"
              title="Nog geen lesse nie"
              body="Plak ’n YouTube-skakel en die klas kan dadelik kyk."
              action={<AdminBtn href="/admin/videos" icon="plus">Voeg die eerste video by</AdminBtn>}
            />
          ) : (
            <ul>
              {videos.slice(0, 5).map((video) => (
                <li key={video.id} className="desk-row">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-white">{video.title}</p>
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
      </div>

      <h2 className="desk-section-title">Vinnige aksies</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {adminQuickActions.map((item, index) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`desk-quick is-${quickTones[index % quickTones.length]}`}
          >
            <span className="desk-tile">
              <AdminIcon name={item.icon} className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-white">{item.label}</span>
              <span className="block truncate text-sm text-white/55">{item.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

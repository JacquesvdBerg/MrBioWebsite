import Link from "next/link";
import { replyLearnerChat, startLearnerChat } from "@/app/(site)/actions";
import { ChatWorkspace } from "@/components/chat-workspace";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow } from "@/components/ui";
import { getSessionAccount } from "@/lib/auth-role";
import { getChatMessages, getChatThread, getLearnerChatThreads } from "@/lib/live-chat";

export const metadata = {
  title: "Vra die onderwyser",
  description: "Teken in en stuur jou Lewenswetenskappe-vraag direk aan die MrBio-onderwyser.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ id?: string; fout?: string }>;
};

export default async function LiveChatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const account = await getSessionAccount();

  if (!account) {
    return (
      <SectionPage
        eyebrow="Vra die onderwyser"
        title={
          <>
            Eers ’n rekening. <span className="gradient-text">Dan jou vraag.</span>
          </>
        }
        description="Klets is gekoppel aan jóú rekening — nie hierdie foon of skootrekenaar nie. Só kan ons later jou aankope, eksklusiewe speletjies en vordering by dieselfde profiel hou."
        crumbs={[
          { href: "/", label: "Tuis" },
          { href: "/live-chat", label: "Vra die onderwyser" },
        ]}
      >
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <Reveal>
            <div className="glass rounded-[1.8rem] p-6">
              <p className="font-display text-2xl font-bold text-white">Nuwe leerder</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Skep ’n rekening met jou naam, e-pos en wagwoord. Daarna kan jy Mnr. Bio vra vanaf enige toestel.
              </p>
              <Link href="/rekening?mode=register&next=/live-chat" className="btn btn-lime mt-5 w-full">
                Skep rekening
                <Arrow />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="glass rounded-[1.8rem] p-6">
              <p className="font-display text-2xl font-bold text-white">Het jy al een?</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Teken in en jou vorige kletse is nog daar — selfs as jy ’n nuwe foon het.
              </p>
              <Link href="/rekening?next=/live-chat" className="btn btn-ghost mt-5 w-full">
                Teken in
              </Link>
            </div>
          </Reveal>
        </div>
      </SectionPage>
    );
  }

  const threads = await getLearnerChatThreads(account.userId);
  const selected = params.id ? await getChatThread(params.id) : threads[0] ?? null;
  const owned = selected && selected.userId === account.userId ? selected : null;
  const messages = owned ? await getChatMessages(owned.id) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-0 md:px-6 md:py-6">
      {params.fout === "leeg" ? (
        <p className="px-4 text-sm text-orange">Sit jou vraag in.</p>
      ) : null}
      {params.fout === "stoor" ? (
        <p className="px-4 text-sm text-orange">Kon nie die boodskap stoor nie.</p>
      ) : null}
      <ChatWorkspace
        listHref="/live-chat"
        selectedId={owned?.id ?? null}
        threads={threads}
        selected={owned}
        messages={messages}
        me="learner"
        title={`Hallo, ${account.name}`}
        composerAction={replyLearnerChat}
        newThread={
          <form action={startLearnerChat} className="space-y-2 border-t border-white/8 p-3">
            <input
              className="wa-search mx-0! w-full!"
              name="topic"
              placeholder="Onderwerp — bv. Arteries"
            />
            <input
              className="wa-search mx-0! w-full!"
              name="question"
              required
              placeholder="Begin ’n nuwe gesprek…"
            />
            <button type="submit" className="btn btn-lime w-full">
              Nuwe klets
            </button>
          </form>
        }
      />
    </div>
  );
}

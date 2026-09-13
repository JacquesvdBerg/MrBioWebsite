import {
  deleteChatThread,
  replyToChat,
  setChatThreadStatus,
} from "@/app/(admin)/admin/actions";
import { ChatWorkspace } from "@/components/chat-workspace";
import { AdminBtn } from "@/components/admin-ui";
import {
  getAdminChatMessages,
  getAdminChatThread,
  getAllChatThreads,
} from "@/lib/live-chat";

export const metadata = {
  title: "Lewendige klets",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ id?: string; error?: string }>;
};

export default async function AdminLiveChatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const threads = await getAllChatThreads();
  const selectedId = params.id ?? null;
  const selected = selectedId ? await getAdminChatThread(selectedId) : null;
  const messages = selected ? await getAdminChatMessages(selected.id) : [];

  return (
    <>
      {params.error === "stoor" ? (
        <p className="px-4 py-2 text-sm text-orange">Kon nie die antwoord stoor nie.</p>
      ) : null}
      <ChatWorkspace
        desk
        listHref="/admin/live-chat"
        selectedId={selected?.id ?? null}
        threads={threads}
        selected={selected}
        messages={messages}
        me="admin"
        title="Lewendige klets"
        composerAction={replyToChat}
        extras={
          selected ? (
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              <form action={setChatThreadStatus}>
                <input type="hidden" name="thread_id" value={selected.id} />
                <input
                  type="hidden"
                  name="status"
                  value={selected.status === "open" ? "closed" : "open"}
                />
                <AdminBtn type="submit" tone="ghost">
                  {selected.status === "open" ? "Merk as klaar" : "Maak weer oop"}
                </AdminBtn>
              </form>
              <form action={deleteChatThread}>
                <input type="hidden" name="thread_id" value={selected.id} />
                <button type="submit" className="desk-btn desk-btn-danger">
                  Verwyder gesprek
                </button>
              </form>
            </div>
          ) : null
        }
      />
    </>
  );
}

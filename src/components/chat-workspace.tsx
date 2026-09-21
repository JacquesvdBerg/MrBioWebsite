import Link from "next/link";
import type { ReactNode } from "react";
import { formatDeskDate } from "@/lib/dates";
import { previewChat, type ChatMessage, type ChatThread } from "@/lib/live-chat";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "MB";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ChatWorkspace({
  desk = false,
  listHref,
  selectedId,
  threads,
  selected,
  messages,
  me,
  title,
  composerAction,
  composerName = "body",
  extras,
  newThread,
  compose,
}: {
  desk?: boolean;
  listHref: string;
  selectedId: string | null;
  threads: ChatThread[];
  selected: ChatThread | null;
  messages: ChatMessage[];
  me: "admin" | "learner";
  title: string;
  composerAction: (formData: FormData) => void | Promise<void>;
  composerName?: string;
  extras?: ReactNode;
  newThread?: ReactNode;
  compose?: ReactNode;
}) {
  const showThread = Boolean(selected) && !compose;

  return (
    <div className={`wa-shell ${desk ? "is-desk" : ""} ${showThread || compose ? "has-thread" : ""}`}>
      <aside className="wa-list">
        <div className="wa-head">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{title}</p>
            <p className="font-display text-lg font-bold text-white">Gesprekke</p>
          </div>
          {newThread}
        </div>
        <div className="wa-rows">
          {threads.length === 0 ? (
            <p className="px-4 py-8 text-sm text-white/45">Nog geen gesprekke nie.</p>
          ) : (
            threads.map((thread) => {
              const href = `${listHref}?id=${thread.id}`;
              const unread = me === "admin" ? thread.unreadForAdmin : thread.unreadForLearner;
              const name = me === "admin" ? thread.learnerName || "Leerder" : thread.topic || "Mnr. Bio";

              return (
                <Link
                  key={thread.id}
                  href={href}
                  className={`wa-row ${selected?.id === thread.id ? "is-active" : ""}`}
                >
                  <span className="wa-avatar">{initials(name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="wa-row-top">
                      <span className="truncate font-bold text-white">{name}</span>
                      <span className="shrink-0 text-[11px] text-white/40">
                        {formatDeskDate(thread.lastMessageAt)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="wa-preview">{previewChat(thread.lastMessage) || "Nuwe gesprek"}</span>
                      {unread ? <span className="wa-unread">1</span> : null}
                    </span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <section className="wa-thread">
        {compose ? (
          compose
        ) : !selected ? (
          <div className="wa-empty">
            <div>
              <p className="font-display text-2xl font-bold text-white">Kies ’n klets</p>
              <p className="mt-2 max-w-sm text-sm leading-6">
                Maak ’n gesprek links oop om die volle draad te sien — soos WhatsApp.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="wa-head">
              <Link href={listHref} className="md:hidden text-sm font-bold text-lime">
                ← Lys
              </Link>
              <span className="wa-avatar">
                {initials(me === "admin" ? selected.learnerName || "Leerder" : "Mnr. Bio")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-white">
                  {me === "admin" ? selected.learnerName || "Leerder" : selected.topic || "Mnr. Bio"}
                </p>
                <p className="truncate text-xs text-white/45">
                  {selected.grade ? `Graad ${selected.grade}` : "Geen graad"}
                  {selected.topic ? ` · ${selected.topic}` : ""}
                  {selected.status === "closed" ? " · Klaar" : ""}
                </p>
              </div>
            </div>
            <div className="wa-messages">
              {messages.map((message) => {
                const mine =
                  (me === "admin" && message.sender === "admin") ||
                  (me === "learner" && message.sender === "learner");

                return (
                  <div key={message.id} className={`chat-bubble ${mine ? "chat-bubble-me" : "chat-bubble-them"}`}>
                    <p>{message.body}</p>
                    <p className={`mt-2 text-[11px] ${mine ? "text-on-accent/60" : "text-white/40"}`}>
                      {formatDeskDate(message.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
            <form action={composerAction} className="wa-composer">
              <input type="hidden" name="thread_id" value={selected.id} />
              <input
                name={composerName}
                required
                placeholder="Tik ’n boodskap"
                aria-label="Boodskap"
              />
              <button type="submit" className="wa-send" aria-label="Stuur">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M3 11.5 21 4l-7.2 16.4-2.4-6.3z" />
                </svg>
              </button>
            </form>
            {extras}
          </>
        )}
      </section>
    </div>
  );
}

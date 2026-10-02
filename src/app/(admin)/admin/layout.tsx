import { AdminChrome } from "@/components/admin-chrome";
import { getSessionAccount } from "@/lib/auth-role";
import { countCommentsByStatus } from "@/lib/comments";
import { countEnquiriesByStatus } from "@/lib/enquiries";
import { countUnreadChatThreads } from "@/lib/live-chat";
import { requireAdmin } from "@/lib/require-admin";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const [account, unreadChat, pendingComments, newEnquiries] = await Promise.all([
    getSessionAccount(),
    countUnreadChatThreads(),
    countCommentsByStatus("pending"),
    countEnquiriesByStatus("new"),
  ]);

  return (
    <div className="mrbio desk">
      <AdminChrome
        user={{ name: account?.name ?? "Mnr. Bio", email: account?.email ?? "" }}
        counts={{
          "/admin/live-chat": unreadChat,
          "/admin/comments": pendingComments,
          "/admin/enquiries": newEnquiries,
        }}
      >
        {children}
      </AdminChrome>
    </div>
  );
}

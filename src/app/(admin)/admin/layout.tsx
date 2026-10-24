import { AdminChrome } from "@/components/admin-chrome";
import { AdminSetupBanner } from "@/components/admin-setup-banner";
import { getSessionAccount } from "@/lib/auth-role";
import { countCommentsByStatus } from "@/lib/comments";
import { countOpenPasswordHelp } from "@/lib/password-help";
import { getResendKeyStatus } from "@/lib/email";
import { countEnquiriesByStatus } from "@/lib/enquiries";
import { countUnreadChatThreads } from "@/lib/live-chat";
import { getOpenAiKeyStatus } from "@/lib/openai-key";
import { requireAdmin } from "@/lib/require-admin";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const [account, unreadChat, pendingComments, newEnquiries, passwordHelp, aiKey, emailKey] = await Promise.all([
    getSessionAccount(),
    countUnreadChatThreads(),
    countCommentsByStatus("pending"),
    countEnquiriesByStatus("new"),
    countOpenPasswordHelp(),
    getOpenAiKeyStatus(),
    getResendKeyStatus(),
  ]);

  return (
    <div className="mrbio desk">
      <AdminChrome
        user={{ name: account?.name ?? "Mnr. Bio", email: account?.email ?? "" }}
        banner={<AdminSetupBanner ai={aiKey.state} email={emailKey.state} />}
        counts={{
          "/admin/live-chat": unreadChat,
          "/admin/comments": pendingComments,
          "/admin/enquiries": newEnquiries,
          "/admin/accounts": passwordHelp,
        }}
      >
        {children}
      </AdminChrome>
    </div>
  );
}

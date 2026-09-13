import { HideOnActivityPlay } from "@/components/hide-on-activity-play";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSessionAccount } from "@/lib/auth-role";
import type { ReactNode } from "react";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const account = await getSessionAccount();

  return (
    <div className="mrbio">
      <SiteHeader
        account={
          account
            ? { name: account.name, isAdmin: account.isAdmin }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <HideOnActivityPlay>
        <SiteFooter />
      </HideOnActivityPlay>
    </div>
  );
}

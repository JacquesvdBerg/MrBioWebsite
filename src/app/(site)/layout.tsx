import { HideOnActivityPlay } from "@/components/hide-on-activity-play";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mrbio">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <HideOnActivityPlay>
        <SiteFooter />
      </HideOnActivityPlay>
    </div>
  );
}

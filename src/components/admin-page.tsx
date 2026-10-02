import Link from "next/link";
import type { ReactNode } from "react";
import { AdminIcon } from "@/components/admin-icon";

type AdminPageProps = {
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  /** Link back to the list an editor belongs to. */
  back?: { href: string; label: string };
  /** Small line above the title, e.g. a status badge. */
  meta?: ReactNode;
  children?: ReactNode;
};

export function AdminPage({ title, description, actions, back, meta, children }: AdminPageProps) {
  return (
    <div className="desk-page mx-auto w-full max-w-6xl">
      {back ? (
        <Link href={back.href} className="desk-back">
          <AdminIcon name="back" className="h-4 w-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {meta ? <div className="mb-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white md:text-[2.4rem] md:leading-[1.1]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/55">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}

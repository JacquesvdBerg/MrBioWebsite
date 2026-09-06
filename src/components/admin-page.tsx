import type { ReactNode } from "react";

type AdminPageProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-white/55">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}

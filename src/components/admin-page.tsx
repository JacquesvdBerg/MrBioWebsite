import type { ReactNode } from "react";

type AdminPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function AdminPage({ title, description, children }: AdminPageProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{description}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}

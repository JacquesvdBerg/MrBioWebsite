import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  visionPath: string;
  children?: ReactNode;
};

export function SectionPage({
  eyebrow,
  title,
  description,
  visionPath,
  children,
}: SectionPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
      <div className="rise max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.06] text-navy md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">{description}</p>
        <p className="mt-4 text-xs text-muted/70">
          Ontwerpverwysing:{" "}
          <code className="rounded bg-cream-dark px-1.5 py-0.5 font-mono">
            {visionPath}
          </code>
        </p>
      </div>
      {children ? <div className="mt-12">{children}</div> : null}
    </div>
  );
}

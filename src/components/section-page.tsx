import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";

type Crumb = {
  href: string;
  label: string;
};

type SectionPageProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  visionPath?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
};

export function SectionPage({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  aside,
  children,
}: SectionPageProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[600px] overflow-hidden">
        <span
          className="orb left-[-10%] top-[-20%] h-[420px] w-[420px]"
          style={{ background: "rgba(184,245,66,0.25)" }}
        />
        <span
          className="orb right-[-6%] top-[10%] h-[360px] w-[360px]"
          style={{ background: "rgba(90,209,255,0.22)", animationDelay: "-6s" }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 md:px-6 md:pt-14">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Broodkrummels" className="rise mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-white/45">
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden>/</span> : null}
                <Link href={crumb.href} className="transition-colors hover:text-lime">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}

        <header
          className={`rise grid gap-8 ${aside ? "lg:grid-cols-[1.2fr_0.8fr] lg:items-end" : ""}`}
        >
          <div className="max-w-3xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.6rem]">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
              {description}
            </p>
            {actions ? (
              <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>
          {aside ? <div className="relative">{aside}</div> : null}
        </header>

        {children ? <div className="mt-12 md:mt-16">{children}</div> : null}
      </div>
    </div>
  );
}

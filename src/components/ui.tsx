import Link from "next/link";
import type { ReactNode } from "react";

type ButtonTone = "navy" | "green" | "purple" | "ghost";

const buttonTone: Record<ButtonTone, string> = {
  navy: "bg-navy text-white hover:bg-navy-deep shadow-[0_12px_28px_rgba(16,40,63,0.28)]",
  green:
    "bg-green text-white hover:bg-green-deep shadow-[0_12px_28px_rgba(47,163,74,0.3)]",
  purple:
    "bg-purple text-white hover:brightness-110 shadow-[0_12px_28px_rgba(94,59,150,0.3)]",
  ghost: "border border-navy/15 bg-white text-navy hover:bg-cream-dark",
};

export function ButtonLink({
  href,
  tone = "navy",
  children,
  className = "",
}: {
  href: string;
  tone?: ButtonTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${buttonTone[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-green ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-[17px] leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

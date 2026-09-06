import Link from "next/link";
import type { ReactNode } from "react";

type ButtonTone = "lime" | "white" | "ghost" | "coral" | "navy" | "green" | "purple";

const buttonTone: Record<ButtonTone, string> = {
  lime: "btn-lime",
  white: "btn-white",
  ghost: "btn-ghost",
  coral: "btn-coral",
  navy: "btn-navy",
  green: "btn-lime",
  purple: "btn-coral",
};

type ButtonSize = "sm" | "md" | "lg";

const buttonSize: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function ButtonLink({
  href,
  tone = "lime",
  size = "md",
  children,
  className = "",
  external = false,
}: {
  href: string;
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = `btn ${buttonTone[tone]} ${buttonSize[size]} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
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
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      className={`mb-10 flex flex-col gap-5 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[2.6rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-[17px] leading-7 text-white/60">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

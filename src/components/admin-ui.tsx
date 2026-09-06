import Link from "next/link";
import type { ReactNode } from "react";

export const deskField =
  "desk-field mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none";

export function AdminBadge({
  tone = "neutral",
  children,
}: {
  tone?: "live" | "draft" | "wait" | "neutral";
  children: ReactNode;
}) {
  return <span className={`desk-badge desk-badge-${tone}`}>{children}</span>;
}

export function AdminBtn({
  href,
  children,
  tone = "navy",
  type = "button",
}: {
  href?: string;
  children: ReactNode;
  tone?: "navy" | "ghost" | "danger";
  type?: "button" | "submit";
}) {
  const className = `desk-btn desk-btn-${tone}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className}>
      {children}
    </button>
  );
}

export function AdminEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="desk-empty">
      <p className="font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-white/55">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminSoon({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="desk-soon">
      <p className="desk-soon-kicker">Word hier bestuur</p>
      <p className="mt-1 font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">{body}</p>
    </div>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-white/55">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="desk-stat desk-stat-link">
        {inner}
      </Link>
    );
  }

  return <article className="desk-stat">{inner}</article>;
}

export function AdminPanel({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`desk-panel ${className}`}>
      {title || action ? (
        <header className="desk-panel-head">
          {title ? <h2 className="font-display text-lg font-bold text-white">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      {padded ? <div className="desk-panel-body">{children}</div> : children}
    </section>
  );
}

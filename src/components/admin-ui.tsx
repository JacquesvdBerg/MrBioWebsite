import Link from "next/link";
import type { ReactNode } from "react";
import { AdminIcon } from "@/components/admin-icon";
import type { AdminIconName } from "@/lib/admin";

export const deskField =
  "desk-field mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none";

export type DeskTone = "green" | "blue" | "violet" | "amber" | "coral" | "teal";

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
  icon,
  size = "md",
  external = false,
}: {
  href?: string;
  children: ReactNode;
  tone?: "navy" | "ghost" | "danger";
  type?: "button" | "submit";
  icon?: AdminIconName;
  size?: "sm" | "md";
  external?: boolean;
}) {
  const className = `desk-btn desk-btn-${tone} ${size === "sm" ? "desk-btn-sm" : ""}`;
  const content = (
    <>
      {icon ? <AdminIcon name={icon} className="h-4 w-4" /> : null}
      {children}
    </>
  );

  if (href) {
    return external ? (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {content}
      </a>
    ) : (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={className}>
      {content}
    </button>
  );
}

export function AdminEmpty({
  title,
  body,
  action,
  icon = "spark",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: AdminIconName;
}) {
  return (
    <div className="desk-empty">
      <span className="desk-empty-icon">
        <AdminIcon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-white/55">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** A callout: dashed for "coming soon", tinted for state notes. */
export function AdminSoon({
  title,
  body,
  kicker = "Word hier bestuur",
  action,
}: {
  title: string;
  body: string;
  kicker?: string;
  action?: ReactNode;
}) {
  return (
    <div className="desk-soon">
      <p className="desk-soon-kicker">{kicker}</p>
      <p className="mt-1 font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">{body}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

/** Success or error line after a form round-trip. */
export function AdminNotice({ tone, children }: { tone: "ok" | "err"; children: ReactNode }) {
  return (
    <p className={`desk-notice is-${tone}`} role={tone === "err" ? "alert" : "status"}>
      <AdminIcon name={tone === "ok" ? "check" : "spark"} className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  href,
  icon,
  tone = "green",
  progress,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: AdminIconName;
  tone?: DeskTone;
  /** 0–1, drawn as a thin bar under the hint. */
  progress?: number;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/50">{label}</p>
        {icon ? (
          <span className="desk-tile">
            <AdminIcon name={icon} className="h-[1.15rem] w-[1.15rem]" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-[2.4rem] font-extrabold leading-none tracking-[-0.04em] text-white">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-white/55">{hint}</p> : null}
      {progress !== undefined ? (
        <span className="desk-meter" aria-hidden>
          <span style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} />
        </span>
      ) : null}
    </>
  );

  const className = `desk-stat is-${tone}`;

  if (href) {
    return (
      <Link href={href} className={`${className} desk-stat-link`}>
        {inner}
      </Link>
    );
  }

  return <article className={className}>{inner}</article>;
}

export function AdminPanel({
  title,
  action,
  children,
  className = "",
  padded = true,
  collapsible = false,
  defaultOpen = true,
  icon,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  /** Fold the panel away behind its title (used for "new item" forms). */
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: AdminIconName;
}) {
  const heading = title ? (
    <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
      {icon ? (
        <span className="desk-tile is-small">
          <AdminIcon name={icon} className="h-4 w-4" />
        </span>
      ) : null}
      {title}
    </h2>
  ) : (
    <span />
  );

  if (collapsible) {
    return (
      <details className={`desk-panel desk-collapse ${className}`} open={defaultOpen}>
        <summary className="desk-panel-head">
          {heading}
          <span className="desk-collapse-toggle" aria-hidden>
            <AdminIcon name="plus" className="h-4 w-4" />
          </span>
        </summary>
        <div className="desk-panel-body">{children}</div>
      </details>
    );
  }

  return (
    <section className={`desk-panel ${className}`}>
      {title || action ? (
        <header className="desk-panel-head">
          {heading}
          {action}
        </header>
      ) : null}
      {padded ? <div className="desk-panel-body">{children}</div> : children}
    </section>
  );
}

/** Segmented filter tabs with optional counts. */
export function AdminTabs({
  tabs,
}: {
  tabs: { href: string; label: string; active: boolean; count?: number }[];
}) {
  return (
    <nav className="desk-tabs" aria-label="Filter">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`desk-tab ${tab.active ? "is-active" : ""}`}
          aria-current={tab.active ? "page" : undefined}
        >
          {tab.label}
          {tab.count !== undefined ? <span className="desk-tab-count">{tab.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

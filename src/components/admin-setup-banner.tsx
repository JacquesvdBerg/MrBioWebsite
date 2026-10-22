import Link from "next/link";
import { AdminIcon } from "@/components/admin-icon";
import { AdminBtn } from "@/components/admin-ui";

type KeyState = "ready" | "missing" | "no-table" | "no-service";

/** Shown above every desk page until the AI key and email are both connected. */
export function AdminSetupBanner({ ai, email }: { ai: KeyState; email: KeyState }) {
  if (ai === "ready" && email === "ready") {
    return null;
  }

  const serverProblem = [ai, email].some((state) => state === "no-table" || state === "no-service");
  const needs = [
    ai === "ready"
      ? null
      : { href: "/admin/settings#ai-sleutel", label: "die AI-sleutel", why: "sodat die weektaak nuwe vasvrae skryf" },
    email === "ready"
      ? null
      : { href: "/admin/settings#e-pos", label: "e-pos", why: "sodat jy van nuwe navrae, kletsvrae en kommentaar hoor" },
  ].filter((need) => need !== null);

  return (
    <div className="desk-setup" role="status">
      <AdminIcon name="settings" className="desk-setup-icon h-5 w-5 shrink-0" />
      <p className="desk-setup-text">
        <strong>Die lessenaar is nog nie klaar opgestel nie.</strong>{" "}
        {serverProblem ? (
          "Die bediener kan nog nie sleutels stoor nie. Vra die ontwikkelaar om dit reg te stel."
        ) : (
          <>
            {needs.map((need, index) => (
              <span key={need.href}>
                {index === 0 ? "Koppel " : ", en koppel "}
                <Link href={need.href}>{need.label}</Link> {need.why}
              </span>
            ))}
            .
          </>
        )}
      </p>
      {serverProblem ? null : (
        <AdminBtn href={needs[0]?.href ?? "/admin/settings"} tone="ghost" size="sm" icon="arrow">
          Stel nou op
        </AdminBtn>
      )}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isActivitySlug } from "@/lib/site";

export function HideOnActivityPlay({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const playing =
    parts[0] === "play-and-learn" &&
    isActivitySlug(parts[1] ?? "") &&
    Boolean(parts[2]);

  if (playing) {
    return null;
  }

  return children;
}

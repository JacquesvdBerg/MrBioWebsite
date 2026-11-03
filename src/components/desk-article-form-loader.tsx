"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type DeskArticleFormType from "@/components/desk-article-form";

// A new article reads its saved draft from this browser, so the form only
// renders on the client.
const DeskArticleForm = dynamic(() => import("@/components/desk-article-form"), {
  ssr: false,
  loading: () => <div className="h-[36rem] animate-pulse rounded-2xl border border-white/10 bg-white/5" aria-hidden />,
});

export function DeskArticleFormLoader(props: ComponentProps<typeof DeskArticleFormType>) {
  return <DeskArticleForm {...props} />;
}

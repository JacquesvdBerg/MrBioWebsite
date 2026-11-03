"use client";

import dynamic from "next/dynamic";

// The form reads the writer's saved draft from this browser, so it only
// renders on the client.
const ForumArticleForm = dynamic(() => import("@/components/forum-article-form"), {
  ssr: false,
  loading: () => <div className="glass h-[34rem] animate-pulse rounded-[1.75rem]" aria-hidden />,
});

export function ForumArticleFormLoader(props: { defaultName: string; sent: boolean }) {
  return <ForumArticleForm {...props} />;
}

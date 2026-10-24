"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { replyToComment } from "@/app/(admin)/admin/actions";
import { createClient } from "@/lib/supabase/client";

const TeacherReplyContext = createContext(false);

function isAdminClaim(claims: Record<string, unknown> | undefined) {
  const meta = claims?.app_metadata;
  if (!meta || typeof meta !== "object") {
    return false;
  }
  return (meta as { role?: unknown }).role === "admin";
}

export function TeacherReplyProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const hasSession = document.cookie.split(";").some((part) => part.includes("-auth-token"));
    if (!hasSession) {
      return;
    }

    const supabase = createClient();
    void supabase.auth.getClaims().then(({ data }) => {
      setIsAdmin(isAdminClaim(data?.claims as Record<string, unknown> | undefined));
    });
  }, []);

  return <TeacherReplyContext.Provider value={isAdmin}>{children}</TeacherReplyContext.Provider>;
}

export function TeacherReplyBox({ parentId }: { parentId: string }) {
  const isAdmin = useContext(TeacherReplyContext);

  if (!isAdmin) {
    return null;
  }

  return (
    <form action={replyToComment} className="mt-4 border-t border-white/10 pt-4">
      <input type="hidden" name="parent_id" value={parentId} />
      <input type="hidden" name="return_to" value="site" />
      <label className="block text-[13px] font-bold text-white" htmlFor={`reply-${parentId}`}>
        Antwoord as onderwyser
      </label>
      <textarea
        id={`reply-${parentId}`}
        name="body"
        required
        className="input-dark mt-2 min-h-24 w-full"
        placeholder="Skryf jou antwoord hier"
      />
      <button type="submit" className="btn btn-lime mt-3">
        Plaas antwoord
      </button>
    </form>
  );
}

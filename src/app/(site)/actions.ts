"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireLearner } from "@/lib/auth-role";
import { isCommentKind } from "@/lib/comments";
import { isEnquiryReason } from "@/lib/enquiries";
import { getChatThread, previewChat } from "@/lib/live-chat";
import { isGrade } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";

function formText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalGrade(formData: FormData) {
  const raw = formText(formData, "grade");
  if (!raw) {
    return null;
  }

  const grade = Number(raw);
  return isGrade(grade) ? grade : null;
}

export async function submitEnquiry(formData: FormData) {
  const name = formText(formData, "name");
  const email = formText(formData, "email");
  const message = formText(formData, "message");
  const reasonRaw = formText(formData, "reason");
  const productSlug = formText(formData, "product_slug");
  const reason = isEnquiryReason(reasonRaw)
    ? reasonRaw
    : productSlug
      ? "Winkel / produk"
      : "Algemene navraag";

  const failQuery = new URLSearchParams();
  if (productSlug) {
    failQuery.set("produk", productSlug);
  }

  if (!name || !email || !message) {
    failQuery.set("fout", "leeg");
    redirect(`/contact?${failQuery.toString()}`);
  }

  const supabase = createAnonClient();

  if (!supabase) {
    failQuery.set("fout", "stoor");
    redirect(`/contact?${failQuery.toString()}`);
  }

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    reason,
    product_slug: productSlug || null,
    grade: optionalGrade(formData),
    message,
    status: "new",
  });

  if (error) {
    console.error("Failed to save enquiry:", error.message);
    failQuery.set("fout", "stoor");
    redirect(`/contact?${failQuery.toString()}`);
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  redirect("/contact?gestuur=1");
}

export async function submitComment(formData: FormData) {
  const authorName = formText(formData, "name");
  const body = formText(formData, "message");
  const kindRaw = formText(formData, "type");
  const kind = isCommentKind(kindRaw) ? kindRaw : "Gedagte";

  if (!authorName || !body) {
    redirect("/comments?fout=leeg");
  }

  const supabase = createAnonClient();

  if (!supabase) {
    redirect("/comments?fout=stoor");
  }

  const { error } = await supabase.from("comments").insert({
    author_name: authorName,
    kind,
    body,
    grade: optionalGrade(formData),
    status: "pending",
  });

  if (error) {
    console.error("Failed to save comment:", error.message);
    redirect("/comments?fout=stoor");
  }

  revalidatePath("/admin/comments");
  revalidatePath("/admin");
  redirect("/comments?gestuur=1");
}

function revalidateChat(threadId?: string) {
  revalidatePath("/live-chat");
  revalidatePath("/admin/live-chat");
  revalidatePath("/admin");
  if (threadId) {
    redirect(`/live-chat?id=${threadId}`);
  }
  redirect("/live-chat");
}

export async function startLearnerChat(formData: FormData) {
  const account = await requireLearner("/live-chat");
  const question = formText(formData, "question");
  const topic = formText(formData, "topic") || "Algemeen";

  if (!question) {
    redirect("/live-chat?fout=leeg");
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      user_id: account.userId,
      learner_name: account.name,
      grade: account.grade,
      topic,
      status: "open",
      unread_for_admin: true,
      unread_for_learner: false,
      last_message: previewChat(question, 180),
      last_message_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to start chat thread:", error?.message);
    redirect("/live-chat?fout=stoor");
  }

  const { error: messageError } = await supabase.from("chat_messages").insert({
    thread_id: data.id,
    sender: "learner",
    body: question,
  });

  if (messageError) {
    console.error("Failed to save learner chat message:", messageError.message);
    redirect("/live-chat?fout=stoor");
  }

  revalidateChat(data.id);
}

export async function replyLearnerChat(formData: FormData) {
  const account = await requireLearner("/live-chat");
  const threadId = formText(formData, "thread_id");
  const body = formText(formData, "body") || formText(formData, "question");

  if (!threadId || !body) {
    redirect("/live-chat?fout=leeg");
  }

  const thread = await getChatThread(threadId);

  if (!thread || thread.userId !== account.userId) {
    redirect("/live-chat?fout=stoor");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("chat_messages").insert({
    thread_id: threadId,
    sender: "learner",
    body,
  });

  if (error) {
    console.error("Failed to save learner chat reply:", error.message);
    redirect(`/live-chat?id=${threadId}&fout=stoor`);
  }

  const { error: threadError } = await supabase
    .from("chat_threads")
    .update({
      status: "open",
      unread_for_admin: true,
      unread_for_learner: false,
      last_message: previewChat(body, 180),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", threadId)
    .eq("user_id", account.userId);

  if (threadError) {
    console.error("Failed to update learner chat thread:", threadError.message);
  }

  revalidateChat(threadId);
}

export async function signOutPublic() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

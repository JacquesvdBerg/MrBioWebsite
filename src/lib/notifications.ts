import "server-only";
import {
  getEmailSettings,
  getResendKey,
  notifyTeacher,
  sendEmail,
  type EmailSettings,
  type SendResult,
} from "@/lib/email";
import { createAnonClient } from "@/lib/supabase/anon";
import { siteName, siteUrl } from "@/lib/site";

// What the teacher receives by email. Site actions call these inside after(),
// so a slow or failed email never holds up the visitor.

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function deskLink(path: string) {
  return `${siteUrl}${path}`;
}

function gradeText(grade: number | null) {
  return grade ? `Graad ${grade}` : "";
}

function short(value: string, length = 80) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

async function productText(slug: string) {
  const supabase = createAnonClient();
  if (!supabase) {
    return slug;
  }

  const { data } = await supabase
    .from("products")
    .select("title, kind, grade, price")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return slug;
  }

  const product = data as { title: string; kind: string; grade: number | null; price: number | null };
  const label = [gradeText(product.grade), product.kind, product.title].filter(Boolean).join(", ");
  return product.price ? `${label} (R${product.price})` : label;
}

export async function notifyEnquiry(enquiry: {
  name: string;
  email: string;
  reason: string;
  grade: number | null;
  productSlug: string;
  message: string;
}) {
  const product = enquiry.productSlug ? await productText(enquiry.productSlug) : "";
  const name = short(enquiry.name);

  await notifyTeacher(
    "enquiries",
    {
      subject: product ? `Nuwe winkelnavraag van ${name}` : `Nuwe navraag van ${name}`,
      heading: "Iemand het die kontakvorm ingevul",
      intro: "Antwoord sommer op hierdie e-pos, dan gaan jou antwoord direk na hulle.",
      rows: [
        ["Naam", name],
        ["E-pos", enquiry.email],
        ["Rede", enquiry.reason],
        ["Graad", gradeText(enquiry.grade)],
        ["Produk", product],
      ],
      quote: enquiry.message,
      action: { label: "Maak navrae oop", href: deskLink("/admin/enquiries") },
    },
    emailPattern.test(enquiry.email) ? enquiry.email : undefined,
  );
}

export async function notifyChat(chat: {
  threadId: string;
  learnerName: string;
  grade: number | null;
  topic: string;
  body: string;
  isNew: boolean;
}) {
  const name = short(chat.learnerName);

  await notifyTeacher("chat", {
    subject: chat.isNew ? `Nuwe kletsvraag van ${name}` : `${name} het weer in die klets geskryf`,
    heading: chat.isNew ? "’n Leerder het ’n vraag in die klets gevra" : "’n Leerder het weer in die klets geskryf",
    intro: "Antwoord op die lessenaar. Die leerder sien jou antwoord sodra hulle die klets oopmaak.",
    rows: [
      ["Leerder", name],
      ["Graad", gradeText(chat.grade)],
      ["Onderwerp", chat.topic],
    ],
    quote: chat.body,
    action: { label: "Antwoord in die klets", href: deskLink(`/admin/live-chat?id=${chat.threadId}`) },
  });
}

export async function notifyComment(comment: {
  authorName: string;
  kind: string;
  grade: number | null;
  body: string;
}) {
  await notifyTeacher("comments", {
    subject: "Nuwe kommentaar wag vir goedkeuring",
    heading: "Nuwe kommentaar op die forum",
    intro: "Dit verskyn eers op die webwerf nadat jy dit goedgekeur het.",
    rows: [
      ["Van", short(comment.authorName)],
      ["Soort", comment.kind],
      ["Graad", gradeText(comment.grade)],
    ],
    quote: comment.body,
    action: { label: "Keur goed of verwyder", href: deskLink("/admin/comments") },
  });
}

/** Sent when the key is saved, and from the test button, to prove email arrives. */
export function sendTestEmail(key: string, settings: EmailSettings) {
  const state = (on: boolean) => (on ? "Aan" : "Af");

  return sendEmail(key, {
    to: settings.to,
    from: settings.from,
    content: {
      subject: `${siteName} se e-pos werk`,
      heading: "Die e-pos is gekoppel",
      intro: `Hierdie toets kom van die ${siteName}-webwerf. Van nou af kry jy ’n e-pos vir elke kennisgewing wat hieronder aan is.`,
      rows: [
        ["Navrae", state(settings.enquiries)],
        ["Kletsvrae", state(settings.chat)],
        ["Kommentaar", state(settings.comments)],
      ],
      action: { label: "Maak die instellings oop", href: deskLink("/admin/settings#e-pos") },
    },
  });
}

/** Tell a new admin their account is ready. The password is never emailed. */
export async function sendWelcomeEmail(account: { email: string; name: string }): Promise<SendResult> {
  const [key, settings] = await Promise.all([getResendKey(), getEmailSettings()]);

  return sendEmail(key, {
    to: account.email,
    from: settings.from,
    replyTo: settings.to,
    content: {
      subject: `Jou ${siteName}-rekening is gereed`,
      heading: account.name ? `Welkom, ${short(account.name)}` : "Welkom",
      intro: `Jy het nou ’n admin-rekening op die ${siteName}-webwerf. Teken in met hierdie e-posadres: ${account.email}`,
      action: { label: "Teken in", href: deskLink("/login") },
      footnote:
        "Die persoon wat jou rekening geskep het, gee vir jou die wagwoord. Wil jy self een kies? Klik op “Wagwoord vergeet?” op die intekenblad.",
    },
  });
}

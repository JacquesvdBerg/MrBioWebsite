"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { useRef, useState, type ReactNode } from "react";
import { requestForumImageUpload } from "@/app/(site)/actions";
import { cleanPastedHtml } from "@/lib/article-paste";
import { mediaBucket } from "@/lib/media-bucket";
import { shrinkImage } from "@/lib/shrink-image";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/upload-image";

type ArticleEditorProps = {
  /** Name of the hidden field that carries the HTML to the form action. */
  name?: string;
  initialHtml?: string;
  /** "desk" uploads as the teacher; "forum" asks the server for a one-off upload address. */
  uploads: "desk" | "forum";
  placeholder?: string;
  onChange?: (html: string) => void;
};

const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** Visitors' articles only keep pictures from our own storage (the server checks again). */
function isOwnImage(src: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(base) && src.startsWith(`${base}/storage/v1/object/public/`);
}

async function uploadPicture(file: File, uploads: ArticleEditorProps["uploads"]) {
  const small = await shrinkImage(file);

  if (uploads === "desk") {
    return uploadImageToStorage(small);
  }

  const ticket = await requestForumImageUpload({ name: small.name, type: small.type, size: small.size });
  if (!ticket.ok) {
    throw new Error(ticket.message);
  }
  const { error } = await createClient()
    .storage.from(mediaBucket)
    .uploadToSignedUrl(ticket.path, ticket.token, small, { contentType: small.type });
  if (error) {
    throw new Error("Kon nie die prent oplaai nie. Probeer weer.");
  }
  return ticket.url;
}

export function ArticleEditor({
  name = "body_html",
  initialHtml = "",
  uploads,
  placeholder = "Begin hier skryf, of plak jou teks uit Word of Google Docs…",
  onChange,
}: ArticleEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const [notice, setNotice] = useState<{ tone: "info" | "err"; text: string } | null>(null);
  const [uploading, setUploading] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const currentEditor = useRef<Editor | null>(null);

  async function insertPictures(editor: Editor, files: File[], at?: number) {
    const pictures = files.filter((file) => imageTypes.includes(file.type));
    if (pictures.length === 0) {
      setNotice({ tone: "err", text: "Gebruik ’n JPG-, PNG-, WebP- of GIF-prent." });
      return;
    }

    setNotice(null);
    setUploading((count) => count + pictures.length);
    for (const file of pictures) {
      try {
        const src = await uploadPicture(file, uploads);
        const image = { type: "image", attrs: { src, alt: "" } };
        if (typeof at === "number") {
          editor.chain().focus().insertContentAt(at, image).run();
        } else {
          editor.chain().focus().insertContent(image).run();
        }
      } catch (caught) {
        setNotice({ tone: "err", text: caught instanceof Error ? caught.message : "Kon nie die prent oplaai nie." });
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto"],
        },
      }),
      Image.configure({
        allowBase64: false,
        resize: {
          enabled: true,
          directions: ["bottom-left", "bottom-right"],
          minWidth: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TableKit.configure({ table: { resizable: false } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: "article-prose rte-content", "aria-label": "Artikelteks" },
      transformPastedHTML(pasted) {
        const cleaned = cleanPastedHtml(pasted, { keepImage: uploads === "desk" ? undefined : isOwnImage });
        if (cleaned.droppedImages > 0) {
          setNotice({
            tone: "info",
            text: "Die teks is geplak. Prente uit Word of ander webwerwe kom nie saam nie; voeg hulle met die prentknoppie by.",
          });
        }
        return cleaned.html;
      },
      handlePaste(view, event) {
        const data = event.clipboardData;
        // Word also puts a picture of the copied text on the clipboard; only
        // upload files when nothing else came along.
        if (!data || data.getData("text/html") || data.getData("text/plain")) {
          return false;
        }
        const files = Array.from(data.files);
        if (files.length === 0 || !currentEditor.current) {
          return false;
        }
        event.preventDefault();
        void insertPictures(currentEditor.current, files);
        return true;
      },
      handleDrop(view, event, _slice, moved) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || files.length === 0 || !currentEditor.current) {
          return false;
        }
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertPictures(currentEditor.current, files, at);
        return true;
      },
    },
    onCreate({ editor: created }) {
      currentEditor.current = created;
    },
    onDestroy() {
      currentEditor.current = null;
    },
    onUpdate({ editor: changed }) {
      const next = changed.isEmpty ? "" : changed.getHTML();
      setHtml(next);
      onChange?.(next);
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            block: e.isActive("heading", { level: 2 })
              ? "h2"
              : e.isActive("heading", { level: 3 })
                ? "h3"
                : e.isActive("heading", { level: 4 })
                  ? "h4"
                  : "p",
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            left: e.isActive({ textAlign: "left" }),
            center: e.isActive({ textAlign: "center" }),
            right: e.isActive({ textAlign: "right" }),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  function openLink() {
    if (!editor) {
      return;
    }
    setLinkValue(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  function saveLink() {
    if (!editor) {
      return;
    }
    const href = linkValue.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) {
      chain.unsetLink().run();
    } else {
      const full = /^(https?:|mailto:)/i.test(href) ? href : `https://${href}`;
      if (editor.state.selection.empty && !editor.isActive("link")) {
        chain.insertContent({ type: "text", text: full, marks: [{ type: "link", attrs: { href: full } }] }).run();
      } else {
        chain.setLink({ href: full }).run();
      }
    }
    setLinkOpen(false);
  }

  const run = (command: (e: Editor) => void) => () => {
    if (editor) {
      command(editor);
    }
  };

  return (
    <div className="rte">
      <input type="hidden" name={name} value={html} />
      <div className="rte-toolbar" role="toolbar" aria-label="Formatering">
        <ToolButton label="Ontdoen" disabled={!state?.canUndo} onClick={run((e) => e.chain().focus().undo().run())}>
          <Icon d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />
        </ToolButton>
        <ToolButton label="Herdoen" disabled={!state?.canRedo} onClick={run((e) => e.chain().focus().redo().run())}>
          <Icon d="m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3" />
        </ToolButton>
        <span className="rte-sep" />
        <select
          className="rte-select"
          aria-label="Teksstyl"
          value={state?.block ?? "p"}
          onChange={(event) => {
            if (!editor) {
              return;
            }
            const value = event.target.value;
            const chain = editor.chain().focus();
            if (value === "p") {
              chain.setParagraph().run();
            } else {
              chain.setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
            }
          }}
        >
          <option value="p">Gewone teks</option>
          <option value="h2">Opskrif</option>
          <option value="h3">Subopskrif</option>
          <option value="h4">Klein opskrif</option>
        </select>
        <span className="rte-sep" />
        <ToolButton label="Vetdruk" active={state?.bold} onClick={run((e) => e.chain().focus().toggleBold().run())}>
          <Icon d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" strong />
        </ToolButton>
        <ToolButton label="Kursief" active={state?.italic} onClick={run((e) => e.chain().focus().toggleItalic().run())}>
          <Icon d="M14 5h-4M14 19h-4M14.5 5l-5 14" />
        </ToolButton>
        <ToolButton
          label="Onderstreep"
          active={state?.underline}
          onClick={run((e) => e.chain().focus().toggleUnderline().run())}
        >
          <Icon d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
        </ToolButton>
        <ToolButton label="Deurhaal" active={state?.strike} onClick={run((e) => e.chain().focus().toggleStrike().run())}>
          <Icon d="M5 12h14M16 7.5C15.4 5.9 13.8 5 12 5c-2.5 0-4 1.3-4 3 0 1.2.8 2.1 2.2 2.6M8 16.5c.6 1.6 2.2 2.5 4 2.5 2.5 0 4-1.3 4-3 0-.6-.2-1.1-.5-1.5" />
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton label="Kolpuntlys" active={state?.bullet} onClick={run((e) => e.chain().focus().toggleBulletList().run())}>
          <Icon d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
        </ToolButton>
        <ToolButton label="Genommerde lys" active={state?.ordered} onClick={run((e) => e.chain().focus().toggleOrderedList().run())}>
          <Icon d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M4 14.5a1.5 1.5 0 1 1 2.5 1L4 19h3" />
        </ToolButton>
        <ToolButton label="Aanhaling" active={state?.quote} onClick={run((e) => e.chain().focus().toggleBlockquote().run())}>
          <Icon d="M7 7h4v4H8.5L7 15M14 7h4v4h-2.5L14 15" />
        </ToolButton>
        <ToolButton label="Skeidingslyn" onClick={run((e) => e.chain().focus().setHorizontalRule().run())}>
          <Icon d="M4 12h16" />
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton label="Links belyn" active={state?.left} onClick={run((e) => e.chain().focus().setTextAlign("left").run())}>
          <Icon d="M4 6h16M4 10h10M4 14h16M4 18h10" />
        </ToolButton>
        <ToolButton label="Sentreer" active={state?.center} onClick={run((e) => e.chain().focus().setTextAlign("center").run())}>
          <Icon d="M4 6h16M7 10h10M4 14h16M7 18h10" />
        </ToolButton>
        <ToolButton label="Regs belyn" active={state?.right} onClick={run((e) => e.chain().focus().setTextAlign("right").run())}>
          <Icon d="M4 6h16M10 10h10M4 14h16M10 18h10" />
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton label="Skakel" active={state?.link || linkOpen} onClick={openLink}>
          <Icon d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </ToolButton>
        <ToolButton label="Prent" onClick={() => fileInput.current?.click()}>
          <Icon d="M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15.5 9h.01" />
        </ToolButton>
        <ToolButton
          label="Tabel"
          active={state?.table}
          onClick={run((e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
        >
          <Icon d="M4 5h16v14H4zM4 10h16M4 15h16M10 5v14M15 5v14" />
        </ToolButton>
        <span className="rte-sep" />
        <ToolButton label="Verwyder formatering" onClick={run((e) => e.chain().focus().unsetAllMarks().clearNodes().run())}>
          <Icon d="M6 5h12M12 5l-3 14M5 19l14-14" />
        </ToolButton>
        <input
          ref={fileInput}
          type="file"
          accept={imageTypes.join(",")}
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (editor && files.length > 0) {
              void insertPictures(editor, files);
            }
          }}
        />
      </div>

      {linkOpen ? (
        <div className="rte-subbar">
          <span className="font-bold">Skakel</span>
          <input
            className="rte-input"
            type="url"
            value={linkValue}
            autoFocus
            placeholder="https://"
            onChange={(event) => setLinkValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveLink();
              }
              if (event.key === "Escape") {
                setLinkOpen(false);
              }
            }}
          />
          <button type="button" className="rte-chip is-primary" onClick={saveLink}>
            Stoor
          </button>
          {state?.link ? (
            <button
              type="button"
              className="rte-chip"
              onClick={() => {
                editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Verwyder skakel
            </button>
          ) : null}
          <button type="button" className="rte-chip" onClick={() => setLinkOpen(false)}>
            Kanselleer
          </button>
        </div>
      ) : null}

      {state?.table ? (
        <div className="rte-subbar">
          <span className="font-bold">Tabel</span>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().addRowAfter().run())}>
            + Ry
          </button>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().addColumnAfter().run())}>
            + Kolom
          </button>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().deleteRow().run())}>
            Verwyder ry
          </button>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().deleteColumn().run())}>
            Verwyder kolom
          </button>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().toggleHeaderRow().run())}>
            Opskrifry aan/af
          </button>
          <button type="button" className="rte-chip" onClick={run((e) => e.chain().focus().mergeOrSplit().run())}>
            Voeg selle saam / verdeel
          </button>
          <button type="button" className="rte-chip is-danger" onClick={run((e) => e.chain().focus().deleteTable().run())}>
            Verwyder tabel
          </button>
        </div>
      ) : null}

      <EditorContent editor={editor} />

      {uploading > 0 || notice ? (
        <p className={`rte-status ${notice?.tone === "err" && uploading === 0 ? "is-err" : ""}`} role="status">
          {uploading > 0 ? `Laai ${uploading === 1 ? "prent" : `${uploading} prente`} op…` : notice?.text}
        </p>
      ) : null}
    </div>
  );
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rte-btn ${active ? "is-on" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Icon({ d, strong = false }: { d: string; strong?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={strong ? 2.6 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

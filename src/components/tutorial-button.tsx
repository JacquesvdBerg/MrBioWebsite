"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Arrow } from "@/components/ui";

type TutorialButtonProps = {
  videoId: string;
  /** The video on YouTube, for new tabs and browsers without JavaScript. */
  href: string;
};

/** The hero's "Kyk tutoriaal" button. It plays the walk-through in a pop-up so
    visitors stay on the site; a ctrl-click or a browser without JavaScript
    opens YouTube instead. */
export function TutorialButton({ videoId, href }: TutorialButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function show(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <a href={href} target="_blank" rel="noreferrer" onClick={show} className="hero-tutorial pointer-events-auto">
        <span className="hero-tutorial-play" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M9 7.5v9l7.5-4.5z" />
          </svg>
        </span>
        <span className="grid gap-1">
          <span className="hero-tutorial-title">
            Kyk <span>tutoriaal</span>
          </span>
          <span className="hero-tutorial-line">
            Hoe die webtuiste werk en hoe om te navigeer
            <Arrow className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
          </span>
        </span>
      </a>

      {/* The player only exists while the pop-up is open, so closing it stops the video. */}
      <dialog
        ref={dialogRef}
        className="video-dialog"
        aria-label="Tutoriaal: hoe die webtuiste werk"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
      >
        <div className="video-dialog-frame">
          {open ? (
            <iframe
              title="Tutoriaal: hoe die webtuiste werk"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>
        <div className="video-dialog-bar">
          <a href={href} target="_blank" rel="noreferrer">
            Kyk op YouTube
          </a>
          <button type="button" className="btn btn-lime" onClick={close}>
            Maak toe
          </button>
        </div>
      </dialog>
    </>
  );
}

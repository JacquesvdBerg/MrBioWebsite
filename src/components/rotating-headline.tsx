"use client";

import { useEffect, useState } from "react";

const LEAD = "Biologie";
const PHRASES = ["wat vassteek.", "wat duidelik is.", "wat lekker is."] as const;
const LONGEST = PHRASES.reduce((a, b) => (a.length >= b.length ? a : b));

const HOLD_MS = 2600;
const TYPE_MS = 48;
const DELETE_MS = 26;
const GAP_MS = 220;

export function RotatingHeadline() {
  const [shown, setShown] = useState<string>(PHRASES[0]);
  const [live, setLive] = useState<string>(PHRASES[0]);

  useEffect(() => {
    const reduced =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return;
    }

    let index = 0;
    let text: string = PHRASES[0];
    let phase: "hold" | "delete" | "type" = "hold";
    let timer = 0;

    const step = () => {
      if (phase === "hold") {
        phase = "delete";
        timer = window.setTimeout(step, HOLD_MS);
        return;
      }

      if (phase === "delete") {
        if (text.length > 0) {
          text = text.slice(0, -1);
          setShown(text);
          timer = window.setTimeout(step, DELETE_MS);
          return;
        }
        index = (index + 1) % PHRASES.length;
        phase = "type";
        timer = window.setTimeout(step, GAP_MS);
        return;
      }

      const target = PHRASES[index];
      if (text.length < target.length) {
        text = target.slice(0, text.length + 1);
        setShown(text);
        timer = window.setTimeout(step, TYPE_MS);
        return;
      }

      setLive(target);
      phase = "hold";
      timer = window.setTimeout(step, HOLD_MS);
    };

    timer = window.setTimeout(step, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <h1 className="font-display text-[3rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5rem]">
      {LEAD}
      <br />
      <span className="headline-accent">
        <span className="invisible" aria-hidden>
          {LONGEST}
        </span>
        <span className="headline-typed">
          {shown}
          <span className="headline-caret" aria-hidden />
        </span>
      </span>
      <span className="sr-only" aria-live="polite">
        {`${LEAD} ${live}`}
      </span>
    </h1>
  );
}

"use client";

import { useEffect, useRef } from "react";

type Rgb = [number, number, number];

type Palette = {
  strandA: Rgb;
  strandB: Rgb;
  A: Rgb;
  T: Rgb;
  G: Rgb;
  C: Rgb;
  fg: Rgb;
};

type Base = "A" | "T" | "G" | "C";

const PAIRS = 26;
const PAIRS_PER_TURN = 10;
const STEP = (Math.PI * 2) / PAIRS_PER_TURN;
const IDLE_SPIN = 0.35;
const SCROLL_SPIN = 0.0042;
const FRAME_MS = 1000 / 45;

const BASE_NAME: Record<Base, string> = {
  A: "Adenien",
  T: "Timien",
  G: "Guanien",
  C: "Sitosien",
};

// Deterministic base sequence so the strand reads the same on every visit.
const SEQUENCE: Array<[Base, Base]> = (() => {
  const out: Array<[Base, Base]> = [];
  let seed = 11;
  for (let i = 0; i < PAIRS; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    out.push(r < 0.25 ? ["A", "T"] : r < 0.5 ? ["T", "A"] : r < 0.75 ? ["G", "C"] : ["C", "G"]);
  }
  return out;
})();

function hexToRgb(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().replace("#", "");
  if (hex.length !== 6) {
    return fallback;
  }
  const n = Number.parseInt(hex, 16);
  if (Number.isNaN(n)) {
    return fallback;
  }
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba([r, g, b]: Rgb, alpha: number, light = 1) {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * light)));
  return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${alpha})`;
}

function readPalette(node: HTMLElement): Palette {
  const style = getComputedStyle(node);
  const read = (name: string, fallback: Rgb) =>
    hexToRgb(style.getPropertyValue(name), fallback);
  return {
    strandA: read("--lime", [184, 245, 66]),
    strandB: read("--sky", [90, 209, 255]),
    A: read("--coral", [255, 106, 77]),
    T: read("--sun", [255, 200, 87]),
    G: read("--violet", [157, 140, 255]),
    C: read("--mint", [63, 224, 160]),
    fg: read("--fg", [255, 255, 255]),
  };
}

type Item =
  | { kind: "bead"; z: number; x: number; y: number; s: number; color: Rgb }
  | { kind: "seg"; z: number; x1: number; y1: number; x2: number; y2: number; s: number; color: Rgb }
  | { kind: "rung"; z: number; index: number; ax: number; ay: number; bx: number; by: number; s: number; a: Rgb; b: Rgb };

type DnaCanvasProps = {
  className?: string;
};

/**
 * Pseudo-3D double helix drawn on a 2D canvas. Costs a fraction of a
 * millisecond per frame, has no dependencies, spins with scroll, tilts toward
 * the pointer, and names the base pair under the cursor.
 */
export function DnaCanvas({ className = "" }: DnaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const pairRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !label) {
      return;
    }

    const reducedMotion =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    let palette = readPalette(canvas);
    let width = 1;
    let height = 1;
    let dpr = 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
    }

    let rotation = 0;
    let scrollTarget = window.scrollY * SCROLL_SPIN;
    let scrollRotation = scrollTarget;
    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let hoverX = -1;
    let hoverY = -1;
    let hovered = -1;
    let paused = false;
    let frame = 0;
    let last = 0;
    const start = performance.now();

    function draw(now: number) {
      const t = (now - start) / 1000;
      const w = width;
      const h = height;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      const radius = Math.min(w * 0.22, 125);
      const rise = (h * 0.96) / PAIRS;
      const y0 = -((PAIRS - 1) * rise) / 2;
      const bob = reducedMotion ? 0 : Math.sin(t * 0.6) * 6;
      const spin = rotation + scrollRotation;

      // Soft atmosphere behind the strand so it sits in the page, not on it.
      const glow = ctx!.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.45);
      glow.addColorStop(0, rgba(palette.strandA, 0.16));
      glow.addColorStop(0.55, rgba(palette.strandB, 0.06));
      glow.addColorStop(1, rgba(palette.strandB, 0));
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, w, h);

      ctx!.save();
      ctx!.translate(w / 2, h / 2 + bob);
      ctx!.rotate(-0.22 + tiltX * 0.05);
      const skew = 1 + tiltY * 0.04;
      const matrix = ctx!.getTransform();

      const items: Item[] = [];

      for (let i = 0; i < PAIRS; i += 1) {
        const angle = i * STEP + spin;
        const y = (y0 + i * rise) * skew;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const a = { x: cos * radius, y, z: sin };
        const b = { x: -cos * radius, y, z: -sin };
        const [baseA, baseB] = SEQUENCE[i];
        items.push({
          kind: "rung",
          z: 0,
          index: i,
          ax: a.x,
          ay: a.y,
          bx: b.x,
          by: b.y,
          s: 1,
          a: palette[baseA],
          b: palette[baseB],
        });
        items.push({ kind: "bead", z: a.z, x: a.x, y: a.y, s: 0.8 + (a.z + 1) * 0.16, color: palette.strandA });
        items.push({ kind: "bead", z: b.z, x: b.x, y: b.y, s: 0.8 + (b.z + 1) * 0.16, color: palette.strandB });
      }

      // Sample the backbone between beads so the strands curve smoothly.
      const SUB = 5;
      for (let i = -1; i < PAIRS; i += 1) {
        for (let k = 0; k < SUB; k += 1) {
          const u0 = i + k / SUB;
          const u1 = i + (k + 1) / SUB;
          const a0 = u0 * STEP + spin;
          const a1 = u1 * STEP + spin;
          const y0u = (y0 + u0 * rise) * skew;
          const y1u = (y0 + u1 * rise) * skew;
          for (const [sign, color] of [
            [1, palette.strandA],
            [-1, palette.strandB],
          ] as Array<[number, Rgb]>) {
            const z = ((Math.sin(a0) + Math.sin(a1)) / 2) * sign;
            items.push({
              kind: "seg",
              z,
              x1: Math.cos(a0) * radius * sign,
              y1: y0u,
              x2: Math.cos(a1) * radius * sign,
              y2: y1u,
              s: 0.8 + (z + 1) * 0.16,
              color,
            });
          }
        }
      }

      items.sort((p, q) => p.z - q.z);

      // Hit-test the pointer against each rung in screen space.
      let nearest = -1;
      let nearestDist = 14;
      if (hoverX >= 0) {
        for (const item of items) {
          if (item.kind !== "rung") {
            continue;
          }
          const pa = matrix.transformPoint({ x: item.ax, y: item.ay });
          const pb = matrix.transformPoint({ x: item.bx, y: item.by });
          const sx = pa.x / dpr;
          const sy = pa.y / dpr;
          const ex = pb.x / dpr;
          const ey = pb.y / dpr;
          const dx = ex - sx;
          const dy = ey - sy;
          const len2 = dx * dx + dy * dy || 1;
          const u = Math.max(0, Math.min(1, ((hoverX - sx) * dx + (hoverY - sy) * dy) / len2));
          const px = sx + u * dx;
          const py = sy + u * dy;
          const dist = Math.hypot(hoverX - px, hoverY - py);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = item.index;
          }
        }
      }
      hovered = nearest;

      ctx!.lineCap = "round";
      for (const item of items) {
        const depth = (item.z + 1) / 2;
        const light = 0.6 + depth * 0.5;
        const alpha = 0.55 + depth * 0.45;
        switch (item.kind) {
          case "rung": {
            const isHot = item.index === hovered;
            const cx = (item.ax + item.bx) / 2;
            const cy = (item.ay + item.by) / 2;
            ctx!.lineWidth = isHot ? 8 : 5.5;
            if (isHot) {
              ctx!.shadowColor = rgba(palette.fg, 0.55);
              ctx!.shadowBlur = 18;
            }
            ctx!.strokeStyle = rgba(item.a, isHot ? 1 : 0.85, isHot ? 1.15 : 1);
            ctx!.beginPath();
            ctx!.moveTo(item.ax, item.ay);
            ctx!.lineTo(cx, cy);
            ctx!.stroke();
            ctx!.strokeStyle = rgba(item.b, isHot ? 1 : 0.85, isHot ? 1.15 : 1);
            ctx!.beginPath();
            ctx!.moveTo(cx, cy);
            ctx!.lineTo(item.bx, item.by);
            ctx!.stroke();
            ctx!.shadowBlur = 0;
            ctx!.fillStyle = rgba(palette.fg, isHot ? 1 : 0.8);
            ctx!.beginPath();
            ctx!.arc(cx, cy, isHot ? 4 : 2.6, 0, Math.PI * 2);
            ctx!.fill();
            break;
          }
          case "seg": {
            ctx!.lineWidth = 8 * item.s;
            ctx!.strokeStyle = rgba(item.color, alpha, light);
            ctx!.beginPath();
            ctx!.moveTo(item.x1, item.y1);
            ctx!.lineTo(item.x2, item.y2);
            ctx!.stroke();
            break;
          }
          case "bead": {
            const r = 9.5 * item.s;
            const grad = ctx!.createRadialGradient(
              item.x - r * 0.35,
              item.y - r * 0.35,
              r * 0.15,
              item.x,
              item.y,
              r,
            );
            grad.addColorStop(0, rgba(item.color, alpha, light + 0.35));
            grad.addColorStop(0.6, rgba(item.color, alpha, light));
            grad.addColorStop(1, rgba(item.color, alpha, light * 0.55));
            ctx!.fillStyle = grad;
            ctx!.beginPath();
            ctx!.arc(item.x, item.y, r, 0, Math.PI * 2);
            ctx!.fill();
            break;
          }
          default: {
            const _exhaustive: never = item;
            return _exhaustive;
          }
        }
      }
      ctx!.restore();

      if (hovered >= 0) {
        const rung = items.find((item) => item.kind === "rung" && item.index === hovered);
        if (rung && rung.kind === "rung") {
          const mid = matrix.transformPoint({
            x: (rung.ax + rung.bx) / 2,
            y: (rung.ay + rung.by) / 2,
          });
          const [baseA, baseB] = SEQUENCE[hovered];
          label!.style.left = `${mid.x / dpr}px`;
          label!.style.top = `${mid.y / dpr}px`;
          label!.dataset.show = "true";
          if (pairRef.current) {
            pairRef.current.textContent = `${baseA} – ${baseB}`;
          }
          if (nameRef.current) {
            nameRef.current.textContent = `${BASE_NAME[baseA]} pas met ${BASE_NAME[baseB]}`;
          }
        }
      } else {
        label!.dataset.show = "false";
      }
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (paused) {
        return;
      }
      if (now - last < FRAME_MS) {
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      rotation += IDLE_SPIN * dt;
      scrollRotation += (scrollTarget - scrollRotation) * 0.08;
      tiltX += (pointerX - tiltX) * 0.06;
      tiltY += (pointerY - tiltY) * 0.06;
      draw(now);
    }

    function drawOnce() {
      scrollRotation = scrollTarget;
      tiltX = pointerX;
      tiltY = pointerY;
      draw(performance.now());
    }

    function onScroll() {
      scrollTarget = window.scrollY * SCROLL_SPIN;
      if (reducedMotion) {
        drawOnce();
      }
    }

    function onPointerMove(event: PointerEvent) {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      const rect = canvas!.getBoundingClientRect();
      hoverX = event.clientX - rect.left;
      hoverY = event.clientY - rect.top;
      if (hoverX < 0 || hoverY < 0 || hoverX > rect.width || hoverY > rect.height) {
        hoverX = -1;
        hoverY = -1;
      }
      if (reducedMotion) {
        drawOnce();
      }
    }

    function onPointerLeave() {
      hoverX = -1;
      hoverY = -1;
      if (reducedMotion) {
        drawOnce();
      }
    }

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) {
        drawOnce();
      }
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
      if (reducedMotion) {
        drawOnce();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          paused = !entry.isIntersecting || document.visibilityState === "hidden";
        }
      },
      { rootMargin: "80px" },
    );
    visibility.observe(canvas);

    function onVisibility() {
      paused = document.visibilityState === "hidden";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    canvas.dataset.ready = "true";
    if (reducedMotion) {
      drawOnce();
    } else {
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={`h-full w-full ${className || "relative"}`}>
      <canvas ref={canvasRef} className="dna-canvas block h-full w-full" aria-hidden="true" />
      <div ref={labelRef} className="dna-label" data-show="false" aria-hidden="true">
        <span ref={pairRef} className="dna-label-pair" />
        <span ref={nameRef} className="dna-label-name" />
      </div>
    </div>
  );
}

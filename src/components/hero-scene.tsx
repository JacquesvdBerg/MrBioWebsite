"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Arrow } from "@/components/ui";

// The floating-island hero. One Higgsfield image was split into a sky plate
// and transparent layers (public/images/home/island). Each layer sits at its
// original place on a stage with the image's aspect ratio, floats on its own
// rhythm and shifts with the pointer by its depth, so the scene feels 3D.

type LayerId = "sky" | "island" | "cell" | "float-top" | "float-low";

type Layer = {
  id: LayerId;
  /** Box within the full image, in percent. */
  box: { left: number; top: number; width: number; height: number };
  /** Pointer shift in px at the edge of the screen. */
  depth: number;
  /** Degrees of tilt toward the pointer. */
  tilt: number;
  float: { amp: number; duration: number; delay: number; rotate: number };
  src: string;
};

const layers: Layer[] = [
  {
    id: "sky",
    box: { left: 0, top: 0, width: 100, height: 100 },
    depth: 8,
    tilt: 0,
    float: { amp: 0, duration: 0, delay: 0, rotate: 0 },
    src: "/images/home/island/sky.jpg",
  },
  {
    id: "island",
    box: { left: 50.223, top: 0, width: 49.777, height: 98.158 },
    depth: 22,
    tilt: 4,
    float: { amp: 10, duration: 7, delay: 0, rotate: 0.6 },
    src: "/images/home/island/island.webp",
  },
  {
    id: "cell",
    box: { left: 39.918, top: 18.487, width: 23.884, height: 38.355 },
    depth: 36,
    tilt: 7,
    float: { amp: 14, duration: 8.5, delay: -2.5, rotate: 3 },
    src: "/images/home/island/cell.webp",
  },
  {
    id: "float-top",
    box: { left: 48.438, top: 4.342, width: 27.679, height: 31.513 },
    depth: 50,
    tilt: 0,
    float: { amp: 12, duration: 5.5, delay: -1, rotate: 5 },
    src: "/images/home/island/float-top.webp",
  },
  {
    id: "float-low",
    box: { left: 39.732, top: 50.066, width: 19.866, height: 41.316 },
    depth: 60,
    tilt: 0,
    float: { amp: 16, duration: 6.5, delay: -3, rotate: -7 },
    src: "/images/home/island/float-low.webp",
  },
];

type Hotspot = {
  id: string;
  layer: LayerId;
  /** Position within the full image, as fractions. */
  x: number;
  y: number;
  title: string;
  body: string;
  href: string;
  label: string;
};

const hotspots: Hotspot[] = [
  {
    id: "sel",
    layer: "cell",
    x: 0.516,
    y: 0.371,
    title: "Die sel",
    body: "Byna elke sel in jou liggaam het ’n kern met jou volledige DNA-resep. Rooibloedselle is die uitsondering: hulle verloor hul kern.",
    href: "/graad/10",
    label: "Selle in graad 10",
  },
  {
    id: "mikroskoop",
    layer: "island",
    x: 0.69,
    y: 0.375,
    title: "Die ligmikroskoop",
    body: "’n Skoolmikroskoop vergroot tot sowat 1 000 keer — genoeg om selle, hul kerne en selfs chloroplaste te sien.",
    href: "/graad/10",
    label: "Selle in graad 10",
  },
  {
    id: "dna",
    layer: "island",
    x: 0.812,
    y: 0.17,
    title: "DNA",
    body: "As jy die DNA in een van jou selle uitrek, is dit sowat 2 meter lank — opgerol in ’n kern wat net ’n paar duisendstes van ’n millimeter groot is.",
    href: "/graad/12",
    label: "DNA in graad 12",
  },
  {
    id: "saailing",
    layer: "island",
    x: 0.634,
    y: 0.545,
    title: "Fotosintese",
    body: "Plante maak hul eie kos: met sonlig, water en koolstofdioksied bou hulle glukose. Die suurstof wat jy inasem, is die byproduk.",
    href: "/graad/11",
    label: "Fotosintese in graad 11",
  },
  {
    id: "springbok",
    layer: "island",
    x: 0.834,
    y: 0.57,
    title: "Hoekom pronk ’n springbok?",
    body: "Springbokke spring soms styfbeen hoog in die lug. Een verklaring is dat dit roofdiere wys hoe fiks hulle is en dat jaagtery nie die moeite werd is nie.",
    href: "/play-and-learn",
    label: "Speel ’n speletjie",
  },
];

const sky = layers[0];
// Everything but the sky shrinks together (see .island-cluster).
const cluster = layers.slice(1);

function layerStyle(layer: Layer): CSSProperties {
  return {
    left: `${layer.box.left}%`,
    top: `${layer.box.top}%`,
    width: `${layer.box.width}%`,
    height: `${layer.box.height}%`,
    ["--depth" as string]: layer.depth,
    ["--tilt" as string]: layer.tilt,
    ["--float-amp" as string]: `${layer.float.amp}px`,
    ["--float-dur" as string]: `${layer.float.duration}s`,
    ["--float-delay" as string]: `${layer.float.delay}s`,
    ["--float-rot" as string]: `${layer.float.rotate}deg`,
  };
}

function spotStyle(spot: Hotspot): CSSProperties {
  const box = layers.find((layer) => layer.id === spot.layer)!.box;
  return {
    left: `${((spot.x * 100 - box.left) / box.width) * 100}%`,
    top: `${((spot.y * 100 - box.top) / box.height) * 100}%`,
  };
}

export function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [tip, setTip] = useState<{ left: number; top: number; below: boolean } | null>(null);

  // Pointer position drives every layer through CSS variables. It holds still
  // while a fact card is open so the card stays next to its dot.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let frame = 0;
    function onMove(event: PointerEvent) {
      if (activeRef.current || event.pointerType === "touch") {
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root?.style.setProperty("--mx", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        root?.style.setProperty("--my", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const place = useCallback((id: string) => {
    const root = rootRef.current;
    const dot = root?.querySelector<HTMLElement>(`[data-spot="${id}"]`);
    if (!root || !dot) {
      return;
    }
    const box = root.getBoundingClientRect();
    const rect = dot.getBoundingClientRect();
    const left = rect.left + rect.width / 2 - box.left;
    const top = rect.top + rect.height / 2 - box.top;
    setTip({
      left: Math.min(Math.max(left, 176), box.width - 176),
      top,
      below: top < box.height * 0.45,
    });
  }, []);

  function toggle(id: string) {
    setActive((current) => (current === id ? null : id));
    place(id);
  }

  useEffect(() => {
    if (!active) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
      }
    };
    const onDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".hero-spot, .hero-tip")) {
        setActive(null);
      }
    };
    const onResize = () => place(active);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [active, place]);

  const renderLayer = (layer: Layer) => (
    <div key={layer.id} className={`island-layer is-${layer.id}`} style={layerStyle(layer)}>
      <div className="island-float">
        <Image
          src={layer.src}
          alt={
            layer.id === "island"
              ? "Swewende eiland met ’n mikroskoop, ’n saailing, ’n springbok, ’n akasia en DNA"
              : ""
          }
          fill
          priority={layer.id === "sky" || layer.id === "island"}
          sizes={`${Math.round(layer.box.width * 1.7)}vw`}
          className="pointer-events-none select-none object-fill"
          draggable={false}
        />
        {hotspots
          .filter((item) => item.layer === layer.id)
          .map((item) => (
            <button
              key={item.id}
              type="button"
              data-spot={item.id}
              className={`hero-spot ${active === item.id ? "is-open" : ""}`}
              style={spotStyle(item)}
              aria-label={`Het jy geweet? ${item.title}`}
              aria-expanded={active === item.id}
              onClick={() => toggle(item.id)}
            >
              <span className="hero-spot-plus" aria-hidden />
            </button>
          ))}
      </div>
    </div>
  );

  const spot = hotspots.find((item) => item.id === active) ?? null;

  return (
    <div ref={rootRef} className={`hero-scene absolute inset-0 ${active ? "is-paused" : ""}`}>
      <div className="hero-stage">
        {renderLayer(sky)}
        <div className="island-cluster">{cluster.map(renderLayer)}</div>
      </div>

      {spot && tip ? (
        <div
          className={`hero-tip ${tip.below ? "is-below" : ""}`}
          style={{ left: tip.left, top: tip.top }}
          role="dialog"
          aria-label={spot.title}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
            Het jy geweet?
          </p>
          <p className="mt-1 font-display text-lg font-bold leading-snug text-white">{spot.title}</p>
          <p className="mt-1.5 text-sm leading-6 text-white/75">{spot.body}</p>
          <Link href={spot.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-lime">
            {spot.label}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

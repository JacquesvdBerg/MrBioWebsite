"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
  style?: CSSProperties;
};

export function TiltCard({
  children,
  className = "",
  max = 9,
  glare = true,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [vars, setVars] = useState<CSSProperties>({});
  const [resting, setResting] = useState(true);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType === "touch") {
      return;
    }
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * max * 2;
    const rx = (0.5 - py) * max * 2;
    setResting(false);
    setVars({
      ["--rx" as string]: `${rx.toFixed(2)}deg`,
      ["--ry" as string]: `${ry.toFixed(2)}deg`,
      ["--gx" as string]: `${(px * 100).toFixed(1)}%`,
      ["--gy" as string]: `${(py * 100).toFixed(1)}%`,
      ["--glare" as string]: "1",
    });
  }

  function onLeave() {
    setResting(true);
    setVars({});
  }

  return (
    <div
      ref={ref}
      className={`tilt${resting ? " is-resting" : ""} ${className}`}
      style={{ ...style, ...vars }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      {glare ? <span className="tilt-glare" aria-hidden /> : null}
    </div>
  );
}

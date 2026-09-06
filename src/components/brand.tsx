import { siteName } from "@/lib/site";

type LogoProps = {
  className?: string;
};

export function MrBioMark({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mrbio-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a2f4f" />
          <stop offset="1" stopColor="#0a1428" />
        </linearGradient>
        <linearGradient id="mrbio-strand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8f542" />
          <stop offset="1" stopColor="#3fe0a0" />
        </linearGradient>
        <linearGradient id="mrbio-strand-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ad1ff" />
          <stop offset="1" stopColor="#9d8cff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="20" fill="url(#mrbio-bg)" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="20"
        fill="none"
        stroke="rgba(255,255,255,0.14)"
      />
      <path
        d="M22 12c14 10 14 30 0 40"
        fill="none"
        stroke="url(#mrbio-strand)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M42 12c-14 10-14 30 0 40"
        fill="none"
        stroke="url(#mrbio-strand-2)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M25 22h14M23 32h18M25 42h14"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="3" fill="#b8f542" />
    </svg>
  );
}

export function MrBioWordmark({ className = "" }: LogoProps) {
  return (
    <span
      className={`font-display text-2xl font-extrabold tracking-[-0.03em] text-white ${className}`}
    >
      Mr<span className="text-lime">Bio</span>
      <span className="sr-only">{siteName}</span>
    </span>
  );
}

export function MrBioLogo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <MrBioMark className="h-10 w-10" />
      <MrBioWordmark />
    </span>
  );
}

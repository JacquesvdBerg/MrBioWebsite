type IconProps = {
  className?: string;
};

export function DnaMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M16 6c8 8 8 28 16 36"
        fill="none"
        stroke="#2f8f4e"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M32 6c-8 8-8 28-16 36"
        fill="none"
        stroke="#1c4f8a"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M18 16h12M17 24h14M18 32h12" stroke="#2f8f4e" strokeWidth="2.2" />
    </svg>
  );
}

export function BeakerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9 3h6M10 3v5.2L5.8 18.2A2 2 0 0 0 7.6 21h8.8a2 2 0 0 0 1.8-2.8L14 8.2V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M8 15h8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 19s1-9 10-13c0 0 4 8-1 14-3 3-9-1-9-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 16c3-3 6-6 9-10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M5 5.5v16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.8v6.4L16 12Z" fill="currentColor" />
    </svg>
  );
}

export function PuzzleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9 4h4v3a2 2 0 1 0 3 0V4h3v4h-2a2 2 0 1 0 0 3h2v7H4v-4h2a2 2 0 1 0 0-3H4V4h5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13H7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function BrainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 8a3 3 0 1 1 3-3 3.2 3.2 0 0 1 5.5 2.2A3 3 0 1 1 18 13c0 3-2 5-6 5s-6-2-6-5a3 3 0 0 1 2-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 6h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function UserPlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 19.5c.8-3.4 3.4-5.5 6.5-5.5 1.6 0 3 .5 4.1 1.4M18 13v6M15 16h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DevicesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="13" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="15.5" y="9" width="6" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function BulbIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9 18.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.4 1.1 2.2v.5h5V16c0-.8.3-1.6 1.1-2.2A6 6 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 5h2l2 11h10l2-8H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.2s0-3.3-.4-4.8c-.2-.9-.9-1.6-1.8-1.8C18.2 5.2 12 5.2 12 5.2s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.9 2 12.2 2 12.2s0 3.3.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.8.4-4.8ZM10 15.2V9.2l5.2 3-5.2 3Z" />
    </svg>
  );
}

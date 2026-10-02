import Image from "next/image";
import { siteName, siteTagline } from "@/lib/site";

type LogoProps = {
  className?: string;
};

// The springbok in the lab coat is the brand mascot.
export function MrBioMark({ className = "h-12 w-12" }: LogoProps) {
  return (
    <Image
      src="/images/brand/springbok.png"
      alt=""
      width={160}
      height={160}
      className={`shrink-0 ${className}`}
      priority
    />
  );
}

export function MrBioWordmark({ className = "" }: LogoProps) {
  return (
    <span className={`font-display text-2xl font-extrabold tracking-[-0.03em] text-white ${className}`}>
      Mnr<span className="text-lime">Bio</span>
      <span className="sr-only">{siteName}</span>
    </span>
  );
}

export function MrBioLogo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <MrBioMark className="h-11 w-11 sm:h-14 sm:w-14" />
      <span className="flex flex-col leading-none">
        <MrBioWordmark className="text-[1.5rem] sm:text-[1.75rem]" />
        <span className="mt-1 hidden text-[12px] font-semibold text-white/60 sm:block">{siteTagline}</span>
      </span>
    </span>
  );
}

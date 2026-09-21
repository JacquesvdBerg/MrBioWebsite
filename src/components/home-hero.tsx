import Image from "next/image";
import { RotatingHeadline } from "@/components/rotating-headline";
import { publicFileUrl } from "@/lib/assets";
import { imageFiles } from "@/lib/image-files";

export function HomeHero() {
  const cover =
    publicFileUrl(imageFiles.home.hero) ??
    publicFileUrl(imageFiles.home.menslikeLiggaam);

  return (
    <section className="home-hero relative flex w-full items-center">
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-bg-4 via-bg-2 to-bg" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/55 to-transparent md:via-bg/35" />
      <div className="relative z-10 w-full px-6 pt-24 md:px-16 lg:px-24">
        <div className="max-w-3xl">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-lime">
            Lewenswetenskappe
          </p>
          <div className="mt-5">
            <RotatingHeadline />
          </div>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/75">
            Kort lesse wat die werk duidelik maak, en weeklikse vakverbande speletjies.
          </p>
        </div>
      </div>
    </section>
  );
}

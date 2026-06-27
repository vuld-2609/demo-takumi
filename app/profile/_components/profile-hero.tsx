import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/profile/types";
import HeroBadge from "./hero-badge";

/**
 * ProfileHero — keyvisual banner + circular avatar + name + rank/department +
 * hero-badge pill + icon-collection row (7 gray placeholder slots).
 * Matches mms_A_Info section of the design.
 */
export default function ProfileHero({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");
  return (
    <section className="relative w-full">
      {/* Keyvisual banner background — reuse homepage asset */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/homepage/keyvisual-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
        {/* Dark overlay so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,16,26,0.45) 0%, rgba(0,16,26,0.75) 70%, #00101A 100%)",
          }}
        />
      </div>

      {/* Content column — 680px max-width, centered */}
      <div className="relative z-10 mx-auto flex w-full max-w-[680px] flex-col items-center gap-8 px-4 pb-12 pt-32">
        {/* Circular avatar with gold ring */}
        <div
          className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full"
          style={{ border: "3px solid #FFEA9E", boxShadow: "0 0 12px #FAE287" }}
        >
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>

        {/* Name */}
        <h1
          className="m-0 text-center text-3xl font-bold leading-tight text-[#FFEA9E]"
          style={{ textShadow: "0 0 6px #FAE287" }}
        >
          {profile.displayName}
        </h1>

        {/* Rank + hero-badge row */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/80">{profile.rank}</span>
          {profile.heroBadge && <HeroBadge variant={profile.heroBadge} />}
        </div>

        {/* Icon collection — 7 gray circular placeholder slots */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                aria-hidden
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: "#2E3940" }}
              />
            ))}
          </div>
          <p className="m-0 text-xs text-white/50">{t("iconCollection")}</p>
        </div>
      </div>
    </section>
  );
}

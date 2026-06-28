"use client";

/**
 * KudosBanner — keyvisual banner (A). Full-bleed feather background with a dark
 * overlay; LEFT-aligned title + "KUDOS" wordmark, then the action row:
 * a 738px compose pill (PenIcon + placeholder → opens compose) and a search pill.
 * Content is constrained to the 1152px design column (144px side margins at 1440).
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PenIcon, SearchIcon } from "@/app/_components/home/icons";

interface KudosBannerProps {
  onCompose: () => void;
}

export default function KudosBanner({ onCompose }: KudosBannerProps) {
  const t = useTranslations("kudos");

  return (
    <section className="relative w-full overflow-hidden">
      {/* Keyvisual background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/homepage/keyvisual-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right-top"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,16,26,0.35) 0%, rgba(0,16,26,0.55) 55%, #00101A 100%)",
          }}
        />
      </div>

      {/* Content column — 1152px design width, left-aligned. pt clears the
          fixed 80px header (title sits ~104px from the top in the design). */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1152px] flex-col items-start px-4 pb-14 pt-[104px]">
        {/* Title (≈36px / 44px line in design) */}
        <p
          className="m-0 text-3xl font-extrabold leading-tight text-[#FFEA9E] md:text-4xl"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {t("bannerTitle")}
        </p>

        {/* KUDOS wordmark — 593×104, 10px below the title */}
        <div className="relative mt-2.5 w-[593px] max-w-full" style={{ aspectRatio: "593 / 104" }}>
          <Image src="/homepage/kudos-logo-big.svg" alt="KUDOS" fill sizes="593px" className="object-contain object-left" priority />
        </div>

        {/* Action row — 64px below the wordmark */}
        <div className="mt-16 flex w-full flex-col gap-4 sm:flex-row">
          {/* Compose pill (738px) */}
          <button
            type="button"
            onClick={onCompose}
            aria-label={t("inputPlaceholder")}
            className="flex h-[72px] w-full items-center gap-2 rounded-full px-4 text-left text-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] sm:w-[738px] sm:max-w-full"
            style={{
              backgroundColor: "rgba(255,234,158,0.10)",
              border: "1px solid #998C5F",
              color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            <PenIcon size={20} className="shrink-0 text-[#FFEA9E]" />
            <span className="truncate">{t("inputPlaceholder")}</span>
          </button>

          {/* Search pill — fills remaining width (static, non-priority) */}
          <div
            className="flex h-[72px] min-w-0 flex-1 items-center gap-2 rounded-full px-4 text-sm"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(8px)",
            }}
            aria-label={t("searchPlaceholder")}
          >
            <SearchIcon size={20} className="shrink-0" />
            <span className="truncate">{t("searchPlaceholder")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

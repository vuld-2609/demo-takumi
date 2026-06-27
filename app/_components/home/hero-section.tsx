import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import HomeCountdown from "./home-countdown";
import { ArrowUpRight } from "./icons";

/**
 * Hero / Keyvisual section (specs 3.5, B1–B3): Root Further wordmark, live
 * countdown, event info, and the two CTA buttons. Sits over the keyvisual
 * background rendered by the page root.
 */
export default function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="flex w-full max-w-[1224px] flex-col items-start gap-10">
      {/* ROOT FURTHER wordmark */}
      <Image
        src="/homepage/root-further-logo.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        priority
        className="h-auto w-[280px] sm:w-[360px] lg:w-[451px]"
      />

      {/* Coming soon + countdown + event info */}
      <div className="flex flex-col items-start gap-4">
        <HomeCountdown />

        <div className="flex flex-col gap-2 text-base font-semibold leading-6 text-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-[60px]">
            <p className="m-0">
              <span className="text-[#FFEA9E]">{t("timeLabel")} </span>
              {t("timeValue")}
            </p>
            <p className="m-0">
              <span className="text-[#FFEA9E]">{t("venueLabel")} </span>
              {t("venueValue")}
            </p>
          </div>
          <p className="m-0 tracking-[0.5px]">{t("note")}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        <Link
          href="/awards"
          className="group inline-flex h-[60px] items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 font-bold text-[#00101A] transition-colors hover:bg-[#FFE07A]"
        >
          {t("ctaAwards")}
          <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link
          href="/kudos"
          className="group inline-flex h-[60px] items-center gap-2 rounded-lg border border-[#998C5F] bg-[#FFEA9E]/10 px-6 font-bold text-[#FFEA9E] transition-colors hover:bg-[#FFEA9E]/20"
        >
          {t("ctaKudos")}
          <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}

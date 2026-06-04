import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "./icons";

/**
 * Sun* Kudos promo block (spec D1/D2): dark rounded panel with the campaign
 * copy and a "Chi tiết" CTA on the left, and the large KUDOS wordmark on the
 * right. CTA navigates to the Sun* Kudos page.
 */
export default function SunKudosSection() {
  const t = useTranslations("home.kudos");

  return (
    <section className="w-full max-w-[1224px]">
      <div className="relative mx-auto flex min-h-[500px] w-full max-w-[1120px] items-center overflow-hidden rounded-2xl bg-[#0F0F0F] px-6 py-12 sm:px-16">
        <Image
          src="/homepage/kudos-background.png"
          alt=""
          fill
          aria-hidden
          sizes="1120px"
          className="object-cover"
        />

        <div className="relative z-10 flex w-full flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          {/* Left: copy + CTA */}
          <div className="flex max-w-[457px] flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="m-0 text-base font-semibold text-[#FFEA9E]">{t("label")}</p>
              <h2 className="m-0 text-3xl font-bold text-white sm:text-4xl">{t("title")}</h2>
              <div className="flex flex-col gap-1 text-sm leading-6 text-white/80">
                <p className="m-0 font-semibold text-white">{t("bodyHeading")}</p>
                <p className="m-0">{t("body")}</p>
              </div>
            </div>
            <Link
              href="/kudos"
              className="group inline-flex h-14 w-fit items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 font-bold text-[#00101A] transition-colors hover:bg-[#FFE07A]"
            >
              {t("detail")}
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Right: KUDOS wordmark */}
          <Image
            src="/homepage/kudos-logo-big.svg"
            alt="Sun* Kudos"
            width={364}
            height={72}
            className="h-auto w-[240px] self-end sm:w-[364px] lg:self-center"
          />
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Montserrat } from "next/font/google";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/app/_components/home/site-header";
import SiteFooter from "@/app/_components/home/site-footer";
import { AWARDS } from "./award-data";
import AwardNav from "./_components/award-nav";
import AwardCard from "./_components/award-card";
import AwardKudosBanner from "./_components/award-kudos-banner";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Award System page (/awards, screen zFYDgyj_pD). Auth-gated by the
 * proxy/middleware. Hero keyvisual + the SAA 2025 award catalogue (sticky
 * scroll-spy nav + 6 award cards) + the Sun* Kudos promo banner.
 */
export default async function AwardSystemPage() {
  const t = await getTranslations("awardSystem");

  const navItems = AWARDS.map((a) => ({ key: a.key, label: t(`nav.${a.key}`) }));

  return (
    <div
      className={`${montserrat.className} flex min-h-screen flex-col`}
      style={{ backgroundColor: "#00101A" }}
    >
      <SiteHeader />

      {/* Hero — three layers (matching the design):
          1. keyvisual.png   — clean swirl background (no text/logo)
          2. root-further.png — ROOT FURTHER logo, overlaid top-left
          3. live text       — subtitle + divider + title, overlaid lower-centre
          Cleared from the fixed header. */}
      <div className="relative pt-20">
        <div className="relative w-full">
          {/* Layer 1: swirl background */}
          <Image
            src="/awards/keyvisual.png"
            alt=""
            width={1440}
            height={547}
            priority
            sizes="100vw"
            className="h-auto w-full"
          />

          {/* Layer 2: ROOT FURTHER logo (design: 338×150 at x144,y104 within the
              1440×547 keyvisual → 10% left, 19% top, 23.5% wide) */}
          <Image
            src="/awards/root-further.png"
            alt={t("heroAlt")}
            width={338}
            height={150}
            priority
            className="absolute left-[10%] top-[19%] h-auto w-[23.5%] max-w-[338px]"
          />

          {/* Layer 3: title text, overlaid over the lower artwork (design title
              bottom ≈ 92% of the keyvisual height → anchored 8% from the bottom) */}
          <div className="absolute inset-x-0 bottom-[8%] px-6">
            <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-4 text-center">
              <p className="m-0 text-base font-bold text-white sm:text-2xl">{t("subtitle")}</p>
              {/* Divider (design Rectangle 26: #2E3940, 1px, full content width). */}
              <div className="h-px w-full bg-[#2E3940]" />
              <h1 className="m-0 text-2xl font-bold text-[#FFEA9E] sm:text-4xl lg:text-[57px] lg:leading-[64px]">
                {t("title")}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1224px] px-6 pb-24 pt-12 sm:px-12 lg:px-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left: sticky scroll-spy navigation */}
          <aside className="hidden shrink-0 lg:block lg:w-56">
            <div className="sticky top-28">
              <AwardNav items={navItems} />
            </div>
          </aside>

          {/* Right: award cards */}
          <div className="flex flex-1 flex-col gap-20">
            {AWARDS.map((award, index) => (
              <AwardCard
                key={award.key}
                id={`award-${award.key}`}
                image={award.image}
                title={t(`awards.${award.key}.title`)}
                description={t(`awards.${award.key}.description`)}
                quantityLabel={t("quantityLabel")}
                quantity={award.quantity}
                unit={t(`units.${award.unit}`)}
                prizeLabel={t("prizeLabel")}
                prizes={award.prizes.map((p) => ({
                  value: p.value,
                  note: t(`prizeNotes.${p.note}`),
                }))}
                orLabel={t("or")}
                imageOnLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Sun* Kudos promo banner */}
        <div className="mt-24 flex justify-center">
          <AwardKudosBanner
            badge={t("kudos.badge")}
            label={t("kudos.label")}
            title={t("kudos.title")}
            body={t("kudos.body")}
            detail={t("kudos.detail")}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

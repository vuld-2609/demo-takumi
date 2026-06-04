import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * "Root Further" content block (spec B4): decorative ROOT/FURTHER wordmark
 * watermark above the theme description paragraphs and the English proverb.
 */
export default function RootFurtherContent() {
  const t = useTranslations("home.content");
  const p1 = t("p1").split("\n");
  const p2 = t("p2").split("\n");

  return (
    <section className="flex w-full max-w-[1152px] flex-col items-center gap-8 px-6 py-16 sm:px-[104px] sm:py-[120px]">
      {/* Decorative ROOT / FURTHER wordmark */}
      <div className="flex flex-col items-center" aria-hidden>
        <Image src="/homepage/root-text.png" alt="" width={189} height={67} className="h-auto w-[150px] sm:w-[189px]" />
        <Image src="/homepage/further-text.png" alt="" width={290} height={67} className="h-auto w-[230px] sm:w-[290px]" />
      </div>

      <div className="flex flex-col gap-6 text-base leading-7 text-white sm:text-2xl sm:leading-8">
        {p1.map((para, i) => (
          <p key={`p1-${i}`} className="m-0 text-justify">
            {para}
          </p>
        ))}

        <blockquote className="m-0 text-center text-white">
          <p className="m-0 text-lg leading-8 sm:text-xl">{t("quote")}</p>
          <p className="m-0 text-lg leading-8 sm:text-xl">{t("quoteSource")}</p>
        </blockquote>

        {p2.map((para, i) => (
          <p key={`p2-${i}`} className="m-0 text-justify">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

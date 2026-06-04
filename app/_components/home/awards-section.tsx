import { useTranslations } from "next-intl";
import AwardCard, { type Award } from "./award-card";

/**
 * Awards system section (spec C1 + C2): caption, divider, large title, and a
 * responsive grid of the six award category cards (3 cols desktop, 2 tablet,
 * 1 mobile per ID-15/16).
 */
export default function AwardsSection() {
  const t = useTranslations("home.awards");

  const awards: Award[] = [
    { slug: "top-talent", title: "Top Talent", nameImage: "/homepage/award-name-top-talent.png", nameWidth: 221, description: t("items.topTalent"), detailLabel: t("detail") },
    { slug: "top-project", title: "Top Project", nameImage: "/homepage/award-name-top-project.png", nameWidth: 232, description: t("items.topProject"), detailLabel: t("detail") },
    { slug: "top-project-leader", title: "Top Project Leader", nameImage: "/homepage/award-name-top-project-leader.png", nameWidth: 232, description: t("items.topProjectLeader"), detailLabel: t("detail") },
    { slug: "best-manager", title: "Best Manager", nameImage: "/homepage/award-name-best-manager.png", nameWidth: 232, description: t("items.bestManager"), detailLabel: t("detail") },
    { slug: "signature-2025-creator", title: "Signature 2025 - Creator", nameImage: "/homepage/award-name-signature-2025-creator.png", nameWidth: 232, description: t("items.signatureCreator"), detailLabel: t("detail") },
    { slug: "mvp", title: "MVP (Most Valuable Person)", nameImage: "/homepage/award-name-mvp.png", nameWidth: 116, description: t("items.mvp"), detailLabel: t("detail") },
  ];

  return (
    <section className="flex w-full max-w-[1224px] flex-col gap-20">
      <header className="flex flex-col gap-4">
        <p className="m-0 text-2xl font-bold leading-8 text-white">{t("caption")}</p>
        <div className="h-px w-full bg-[#2E3940]" />
        <h2 className="m-0 text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] sm:text-[57px] sm:leading-[64px]">
          {t("title")}
        </h2>
      </header>

      <div className="grid grid-cols-1 justify-items-center gap-x-20 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => (
          <AwardCard key={award.slug} award={award} />
        ))}
      </div>
    </section>
  );
}

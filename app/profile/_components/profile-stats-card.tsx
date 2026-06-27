import { useTranslations } from "next-intl";
import { GiftIcon } from "@/app/_components/home/icons";
import type { ProfileStats } from "@/lib/profile/types";

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <span
        className="text-2xl font-bold text-[#FFEA9E]"
        style={{ textShadow: "0 0 6px #FAE287" }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * ProfileStatsCard — dark panel with gold border showing 5 stat rows.
 * First 3 rows (kudos + hearts) above the divider; 2 secret-box rows below.
 * "Mở Secret Box" button is a placeholder — disabled, no backend.
 * Matches mms_B_Thống kê section of the design.
 */
export default function ProfileStatsCard({ stats }: { stats: ProfileStats }) {
  const t = useTranslations("profile");
  return (
    <div
      className="mx-auto flex w-full max-w-[680px] flex-col gap-6 rounded-2xl px-8 py-8"
      style={{
        backgroundColor: "#00070C",
        border: "1px solid #998C5F",
        boxShadow: "0 0 16px rgba(255,234,158,0.08)",
      }}
    >
      {/* Stats rows above divider */}
      <div className="flex flex-col gap-4">
        <StatRow label={t("statsKudosReceived")} value={stats.kudosReceived} />
        <StatRow label={t("statsKudosSent")} value={stats.kudosSent} />
        <StatRow label={t("statsHeartsReceived")} value={stats.heartsReceived} />
      </div>

      {/* Divider */}
      <hr className="m-0 border-0 border-t border-[#2E3940]" />

      {/* Secret box rows */}
      <div className="flex flex-col gap-4">
        <StatRow label={t("statsBoxesOpened")} value={stats.boxesOpened} />
        <StatRow label={t("statsBoxesUnopened")} value={stats.boxesUnopened} />
      </div>

      {/* Placeholder button — non-functional */}
      <button
        type="button"
        disabled
        className="mt-2 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold opacity-70"
        style={{ backgroundColor: "#FFEA9E", color: "#00101A" }}
        aria-label={t("openSecretBoxAria")}
      >
        <GiftIcon size={18} />
        {t("openSecretBox")}
      </button>
    </div>
  );
}

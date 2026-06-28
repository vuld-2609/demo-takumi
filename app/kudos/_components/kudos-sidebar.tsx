/**
 * KudosSidebar — right column (section D).
 * Stats panel (reuses ProfileStatsCard look) with kudos.stats.* labels.
 * "Mở Secret Box" disabled placeholder button.
 * Two leaderboards: rankUps (rankUpTitle) and giftReceivers (giftTitle).
 * Each leaderboard row: avatar + name + note (no AvatarHoverCard — no HoverCardData).
 * Empty list → kudos.emptyLeaderboard.
 * Server component.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ProfileStats, LeaderboardEntry } from "@/lib/kudos/types";
import { GiftIcon } from "@/app/_components/home/icons";

interface KudosSidebarProps {
  stats: ProfileStats;
  rankUps: LeaderboardEntry[];
  giftReceivers: LeaderboardEntry[];
}

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

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full"
        style={{ border: "1px solid #998C5F" }}
      >
        <Image
          src={entry.avatarUrl}
          alt={entry.displayName}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-medium text-white/90">{entry.displayName}</p>
        <p className="m-0 truncate text-xs text-white/50">{entry.note}</p>
      </div>
    </div>
  );
}

function Leaderboard({ title, entries }: { title: string; entries: LeaderboardEntry[] }) {
  const t = useTranslations("kudos");

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl px-5 py-5"
      style={{
        backgroundColor: "#00070C",
        border: "1px solid #998C5F",
        boxShadow: "0 0 16px rgba(255,234,158,0.06)",
      }}
    >
      <h3
        className="m-0 text-sm font-bold uppercase tracking-wide text-[#FFEA9E]"
        style={{ textShadow: "0 0 4px #FAE287" }}
      >
        {title}
      </h3>

      {entries.length === 0 ? (
        <p className="text-xs text-white/40">{t("emptyLeaderboard")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KudosSidebar({ stats, rankUps, giftReceivers }: KudosSidebarProps) {
  const t = useTranslations("kudos");

  return (
    <aside className="flex flex-col gap-6">
      {/* Stats panel */}
      <div
        className="flex flex-col gap-6 rounded-2xl px-6 py-6"
        style={{
          backgroundColor: "#00070C",
          border: "1px solid #998C5F",
          boxShadow: "0 0 16px rgba(255,234,158,0.08)",
        }}
      >
        {/* Top stats: kudos + hearts */}
        <div className="flex flex-col gap-4">
          <StatRow label={t("stats.kudosReceived")} value={stats.kudosReceived} />
          <StatRow label={t("stats.kudosSent")} value={stats.kudosSent} />
          <StatRow label={t("stats.hearts")} value={stats.heartsReceived} />
        </div>

        <hr className="m-0 border-0 border-t border-[#2E3940]" />

        {/* Secret box stats */}
        <div className="flex flex-col gap-4">
          <StatRow label={t("stats.boxesOpened")} value={stats.boxesOpened} />
          <StatRow label={t("stats.boxesUnopened")} value={stats.boxesUnopened} />
        </div>

        {/* "Mở Secret Box" — disabled placeholder */}
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold opacity-60"
          style={{ backgroundColor: "#FFEA9E", color: "#00101A" }}
          aria-label={t("stats.openSecretBox")}
        >
          <GiftIcon size={18} />
          {t("stats.openSecretBox")}
        </button>
      </div>

      {/* Rank-up leaderboard */}
      <Leaderboard title={t("rankUpTitle")} entries={rankUps} />

      {/* Gift receivers leaderboard */}
      <Leaderboard title={t("giftTitle")} entries={giftReceivers} />
    </aside>
  );
}

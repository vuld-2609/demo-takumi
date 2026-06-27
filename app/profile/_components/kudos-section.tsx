"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/app/_components/home/icons";
import type { KudosFilter, KudosWithUsers } from "@/lib/profile/types";
import KudosCard from "./kudos-card";

/**
 * KudosSection — "Sun* Annual Awards 2025" caption + big gold "KUDOS" heading
 * + filter dropdown (Đã gửi / Đã nhận). Toggles between the sent and received
 * feeds. "use client" because the filter state is local. Matches mms_C + mms_D.
 */
export default function KudosSection({
  received,
  sent,
}: {
  received: KudosWithUsers[];
  sent: KudosWithUsers[];
}) {
  const t = useTranslations("profile");
  const [filter, setFilter] = useState<KudosFilter>("sent");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const counts: Record<KudosFilter, number> = {
    sent: sent.length,
    received: received.length,
  };
  const visibleKudos = filter === "sent" ? sent : received;
  const labelFor = (f: KudosFilter) =>
    `${f === "sent" ? t("filterSent") : t("filterReceived")} (${counts[f]})`;

  return (
    <section className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-4">
      {/* Section header */}
      <div className="flex flex-col items-center gap-2">
        <p className="m-0 text-sm font-medium uppercase tracking-widest text-white/60">
          {t("awardsCaption")}
        </p>
        <h2
          className="m-0 text-6xl font-extrabold tracking-tight text-[#FFEA9E]"
          style={{ textShadow: "0 0 6px #FAE287" }}
        >
          {t("kudosTitle")}
        </h2>
        {/* Gold underline rule */}
        <div
          className="h-[3px] w-24 rounded-full"
          style={{ backgroundColor: "#FFEA9E", boxShadow: "0 0 6px #FAE287" }}
        />
      </div>

      {/* Filter dropdown — right-aligned */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-[#FFEA9E] transition-colors hover:bg-white/5"
            style={{ borderColor: "#998C5F", backgroundColor: "#00070C" }}
          >
            {labelFor(filter)}
            <ChevronDownIcon
              size={16}
              className={dropdownOpen ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>

          {dropdownOpen && (
            <>
              {/* Click-away overlay */}
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setDropdownOpen(false)}
              />
              <ul
                role="listbox"
                className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[160px] overflow-hidden rounded-lg border py-1 text-sm"
                style={{ borderColor: "#998C5F", backgroundColor: "#00070C" }}
              >
                {(["sent", "received"] as KudosFilter[]).map((f) => (
                  <li key={f}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={filter === f}
                      onClick={() => {
                        setFilter(f);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                      style={{ color: filter === f ? "#FFEA9E" : "rgba(255,255,255,0.7)" }}
                    >
                      {labelFor(f)}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Kudos card list — 24px gap between cards */}
      <div className="flex flex-col gap-6">
        {visibleKudos.map((k) => (
          <KudosCard key={k.id} kudos={k} />
        ))}
        {visibleKudos.length === 0 && (
          <p className="text-center text-sm text-white/40">{t("emptyKudos")}</p>
        )}
      </div>
    </section>
  );
}

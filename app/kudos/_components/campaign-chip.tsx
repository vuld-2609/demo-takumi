"use client";

/**
 * CampaignChip — "x2" flame chip displayed on kudos cards during campaign period.
 * On hover shows a tooltip with campaignTitle + campaignBody from kudos i18n namespace.
 * Static/presentational — no data props required.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CampaignChip() {
  const t = useTranslations("kudos");
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* x2 flame pill */}
      <span
        className="inline-flex cursor-default select-none items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: "#3A0A00",
          border: "1px solid #D4271D",
          color: "#FFEA9E",
        }}
        tabIndex={0}
        role="img"
        aria-label={t("campaignTitle")}
      >
        🔥 x2
      </span>

      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl px-4 py-3 shadow-xl"
          style={{
            backgroundColor: "#101010",
            border: "1px solid #998C5F",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          <p className="m-0 text-xs font-bold text-[#FFEA9E]">{t("campaignTitle")}</p>
          <p className="m-0 mt-1 text-xs leading-relaxed text-white/70">{t("campaignBody")}</p>
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "#998C5F" }}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

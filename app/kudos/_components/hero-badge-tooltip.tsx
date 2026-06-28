"use client";

/**
 * HeroBadgeTooltip — wraps a HeroBadge with a hover/focus tooltip card showing
 * the tier's count requirement and description from home.rules.tier* i18n keys.
 * Props: variant (one of the 4 hero tiers), children (the trigger element).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HeroBadgeVariant } from "@/app/profile/_components/hero-badge";

interface HeroBadgeTooltipProps {
  variant: HeroBadgeVariant;
  children: React.ReactNode;
}

/** Map tier to i18n key prefix in home.rules. */
const TIER_KEY: Record<HeroBadgeVariant, string> = {
  new_hero: "tierNew",
  rising_hero: "tierRising",
  super_hero: "tierSuper",
  legend_hero: "tierLegend",
};

export default function HeroBadgeTooltip({ variant, children }: HeroBadgeTooltipProps) {
  const t = useTranslations("home.rules");
  const [visible, setVisible] = useState(false);
  const key = TIER_KEY[variant];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl px-4 py-3 text-center shadow-xl"
          style={{
            backgroundColor: "#101010",
            border: "1px solid #998C5F",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          {/* Count line — e.g. "Có 1–4 người gửi Kudos cho bạn" */}
          <p className="m-0 text-xs font-bold text-[#FFEA9E]">{t(`${key}Count`)}</p>
          {/* Description */}
          <p className="m-0 mt-1 text-xs text-white/70">{t(`${key}Desc`)}</p>
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

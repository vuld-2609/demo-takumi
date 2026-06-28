"use client";

/**
 * HighlightSection — "HIGHLIGHT KUDOS" section (B).
 * Header: awardsCaption subtitle + highlightTitle; two FilterDropdowns top-right.
 * Selecting a filter pushes to URL search params (?hashtag=...&department=...);
 * clearing omits the param. The server page re-queries from those params.
 * Also resets carousel index to 0 on filter change (handled inside carousel reset
 * via key prop).
 */

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { BoardKudos, FilterOption } from "@/lib/kudos/types";
import FilterDropdown from "./filter-dropdown";
import HighlightCarousel from "./highlight-carousel";

interface HighlightSectionProps {
  items: BoardKudos[];
  hashtagOptions: FilterOption[];
  departmentOptions: FilterOption[];
  onSendKudo: (receiverId: string) => void;
}

export default function HighlightSection({
  items,
  hashtagOptions,
  departmentOptions,
  onSendKudo,
}: HighlightSectionProps) {
  const t = useTranslations("kudos");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hashtag = searchParams.get("hashtag");
  const department = searchParams.get("department");

  /** Push updated search params; omit key when value is null. */
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  /* key on carousel forces remount (index reset) when filters change */
  const carouselKey = `${hashtag ?? "all"}-${department ?? "all"}`;

  return (
    <section className="flex flex-col gap-6">
      {/* Section header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="m-0 text-sm font-medium text-[#FFEA9E]">{t("awardsCaption")}</p>
          <h2
            className="m-0 text-3xl font-bold uppercase tracking-wide text-[#FFEA9E]"
            style={{ textShadow: "0 0 6px #FAE287" }}
          >
            {t("highlightTitle")}
          </h2>
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3">
          <FilterDropdown
            label={t("filterHashtag")}
            options={hashtagOptions}
            value={hashtag}
            onChange={(v) => updateParam("hashtag", v)}
          />
          <FilterDropdown
            label={t("filterDepartment")}
            options={departmentOptions}
            value={department}
            onChange={(v) => updateParam("department", v)}
          />
        </div>
      </div>

      {/* Carousel — remounts on filter change to reset to page 1 */}
      <HighlightCarousel key={carouselKey} items={items} onSendKudo={onSendKudo} />
    </section>
  );
}

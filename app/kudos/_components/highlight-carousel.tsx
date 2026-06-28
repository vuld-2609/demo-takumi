"use client";

/**
 * HighlightCarousel — full-width Highlight Kudos carousel (B.2).
 * CENTER card is a 528×525 square at full opacity; the left/right neighbours
 * peek in at the edges, faded (opacity 0.4) + scaled + blurred + non-interactive.
 * Round chevron arrows overlay the sides (disabled at first/last).
 * Pagination "current/total" with ‹ › below. Empty → kudos.emptyKudos.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "@/app/_components/home/icons";
import type { BoardKudos } from "@/lib/kudos/types";
import HighlightCard from "./highlight-card";

interface HighlightCarouselProps {
  items: BoardKudos[];
  onSendKudo: (receiverId: string) => void;
}

/** One fixed-size square slot; side slots are dimmed/blurred and inert. */
function Slot({
  kudos,
  side,
  onSendKudo,
}: {
  kudos: BoardKudos | null;
  side: boolean;
  onSendKudo: (id: string) => void;
}) {
  return (
    <div
      className="h-[528px] w-[528px] max-w-[88vw] shrink-0 transition-all duration-300"
      style={
        side
          ? { opacity: kudos ? 0.4 : 0, transform: "scale(0.9)", filter: "blur(1px)", pointerEvents: "none" }
          : undefined
      }
      aria-hidden={side || !kudos}
    >
      {kudos && <HighlightCard kudos={kudos} onSendKudo={onSendKudo} />}
    </div>
  );
}

export default function HighlightCarousel({ items, onSendKudo }: HighlightCarouselProps) {
  const t = useTranslations("kudos");
  const [index, setIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-white/40">{t("emptyKudos")}</p>
      </div>
    );
  }

  const total = items.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;
  const prev = () => canPrev && setIndex((i) => i - 1);
  const next = () => canNext && setIndex((i) => i + 1);

  const arrow =
    "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F] disabled:cursor-not-allowed disabled:opacity-25";

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden">
        {/* Cards row — center is sharp, neighbours peek at the edges */}
        <div className="flex items-center justify-center gap-6">
          <Slot kudos={canPrev ? items[index - 1] : null} side onSendKudo={onSendKudo} />
          <Slot kudos={items[index]} side={false} onSendKudo={onSendKudo} />
          <Slot kudos={canNext ? items[index + 1] : null} side onSendKudo={onSendKudo} />
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          aria-label={t("prev")}
          className={`${arrow} left-3 md:left-8`}
          style={{ backgroundColor: "#1A2730", border: "1px solid #2E3940" }}
        >
          <ChevronLeftIcon size={22} className="text-white" />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          aria-label={t("next")}
          className={`${arrow} right-3 md:right-8`}
          style={{ backgroundColor: "#1A2730", border: "1px solid #2E3940" }}
        >
          <ChevronRightIcon size={22} className="text-white" />
        </button>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 text-sm text-white/60">
        <button type="button" onClick={prev} disabled={!canPrev} aria-label={t("prev")} className="text-lg leading-none disabled:opacity-30">
          ‹
        </button>
        <span>
          <span className="font-bold text-[#FFEA9E]">{index + 1}</span>
          <span className="mx-1 text-white/40">/</span>
          <span>{total}</span>
        </span>
        <button type="button" onClick={next} disabled={!canNext} aria-label={t("next")} className="text-lg leading-none disabled:opacity-30">
          ›
        </button>
      </div>
    </div>
  );
}

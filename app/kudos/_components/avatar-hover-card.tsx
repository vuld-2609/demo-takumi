"use client";

/**
 * AvatarHoverCard — wraps any avatar/name trigger; on hover (with 120ms open /
 * 200ms close delay) shows a popover below the trigger with:
 *   name (gold), unitLabel + departmentPath (gray), hero badge, divider,
 *   kudosReceived / kudosSent counts, full-width gold "Gửi KUDO" button.
 * Props: data (HoverCardData), onSendKudo callback, children (trigger element).
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { HoverCardData } from "@/lib/kudos/types";
import { loadHoverCard } from "@/app/actions/kudos";
import HeroBadge from "@/app/profile/_components/hero-badge";

interface AvatarHoverCardProps {
  data: HoverCardData;
  onSendKudo: (receiverId: string) => void;
  children: React.ReactNode;
}

export default function AvatarHoverCard({ data, onSendKudo, children }: AvatarHoverCardProps) {
  const t = useTranslations("kudos");
  const [open, setOpen] = useState(false);
  // Cards only know id/name/badge/department; fetch accurate kudos counts +
  // full unit path lazily the first time the popover opens.
  const [card, setCard] = useState<HoverCardData>(data);
  const fetched = useRef(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open && !fetched.current) {
      fetched.current = true;
      loadHoverCard(data.id).then((fresh) => {
        if (fresh) setCard(fresh);
      });
    }
  }, [open, data.id]);

  function scheduleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 120);
  }

  function scheduleClose() {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }

  function handleSendKudo() {
    setOpen(false);
    onSendKudo(card.id);
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
    >
      {children}

      {open && (
        /* Popover panel — positioned below the trigger, capped to not overflow right */
        <div
          role="dialog"
          aria-label={card.displayName}
          className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl p-5 shadow-2xl"
          style={{
            backgroundColor: "#101010",
            border: "1px solid #998C5F",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          }}
          /* Keep card open when mouse moves into it */
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
        >
          {/* Name */}
          <p
            className="m-0 text-base font-bold leading-tight text-[#FFEA9E]"
            style={{ textShadow: "0 0 6px #FAE287" }}
          >
            {card.displayName}
          </p>

          {/* Unit label + department path */}
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-white/60">
            {t("hover.unitLabel")}: {card.departmentPath}
          </p>

          {/* Hero badge */}
          {card.heroBadge && (
            <div className="mt-3">
              <HeroBadge variant={card.heroBadge} />
            </div>
          )}

          {/* Divider */}
          <hr className="my-3 border-0 border-t border-[#2E3940]" />

          {/* Kudos stats */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">{t("hover.kudosReceived")}</span>
              <span
                className="text-sm font-bold text-[#FFEA9E]"
                style={{ textShadow: "0 0 4px #FAE287" }}
              >
                {card.kudosReceived}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">{t("hover.kudosSent")}</span>
              <span
                className="text-sm font-bold text-[#FFEA9E]"
                style={{ textShadow: "0 0 4px #FAE287" }}
              >
                {card.kudosSent}
              </span>
            </div>
          </div>

          {/* Send Kudo button */}
          <button
            type="button"
            onClick={handleSendKudo}
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
            style={{ backgroundColor: "#FFEA9E", color: "#00101A" }}
          >
            ✏ {t("hover.sendKudo")}
          </button>
        </div>
      )}
    </div>
  );
}

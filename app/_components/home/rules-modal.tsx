"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CloseIcon, PenIcon } from "./icons";

/**
 * "Thể lệ" (Rules) modal — screen b1Filzi9i6. A right-anchored, scrollable dark
 * panel describing the Kudos Hero badges, the 6 collectible icons, and the
 * National Kudos prize. Opened from the floating widget's "Thể lệ" action.
 * Footer: "Đóng" closes the panel; "Viết KUDOS" is a placeholder until the
 * kudos form lands. Rendered through a portal at <body> so it escapes the
 * widget's fixed stacking context and overlays the whole page (incl. header).
 */
export default function RulesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("home.rules");
  const panelRef = useRef<HTMLDivElement>(null);
  // Portals require a DOM target — only available after mount on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // While open: lock body scroll, trap focus, restore focus to the trigger on
  // close, and wire Escape + Tab handling.
  useEffect(() => {
    if (!open) return;
    const triggerEl = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      triggerEl?.focus();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const heroTiers = [
    { img: "hero-new", count: t("tierNewCount"), desc: t("tierNewDesc") },
    { img: "hero-rising", count: t("tierRisingCount"), desc: t("tierRisingDesc") },
    { img: "hero-super", count: t("tierSuperCount"), desc: t("tierSuperDesc") },
    { img: "hero-legend", count: t("tierLegendCount"), desc: t("tierLegendDesc") },
  ];

  // Collectible icon names are brand proper nouns sourced from the design.
  const collectibles = [
    { img: "badge-revival", label: "REVIVAL" },
    { img: "badge-touch-of-light", label: "TOUCH OF LIGHT" },
    { img: "badge-stay-gold", label: "STAY GOLD" },
    { img: "badge-flow-to-horizon", label: "FLOW TO HORIZON" },
    { img: "badge-beyond-the-boundary", label: "BEYOND THE BOUNDARY" },
    { img: "badge-root-further", label: "ROOT FURTHER" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" aria-hidden onClick={onClose} />

      {/* Right-anchored panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className="relative flex h-full w-full max-w-[560px] flex-col bg-[#00101A] shadow-2xl"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-10 sm:px-12">
          <h2 className="m-0 text-4xl font-bold text-[#FFEA9E]">{t("title")}</h2>

          {/* Section 1 — Kudos receivers */}
          <h3 className="mt-8 text-lg font-bold leading-snug text-[#FFEA9E]">
            {t("receiverHeading")}
          </h3>
          <p className="mt-4 text-sm font-semibold leading-6 text-white">
            {t("receiverIntro")}
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {heroTiers.map((tier) => (
              <div key={tier.img}>
                <div className="flex items-center gap-3">
                  <Image
                    src={`/homepage/rules/${tier.img}.png`}
                    alt=""
                    width={126}
                    height={22}
                    sizes="126px"
                    className="h-[22px] w-auto shrink-0"
                  />
                  <span className="text-sm font-bold text-white">{tier.count}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-white/80">{tier.desc}</p>
              </div>
            ))}
          </div>

          {/* Section 2 — Kudos senders */}
          <h3 className="mt-10 text-lg font-bold leading-snug text-[#FFEA9E]">
            {t("senderHeading")}
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/80">{t("senderIntro")}</p>
          <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6">
            {collectibles.map((item) => (
              <div key={item.img} className="flex flex-col items-center gap-2 text-center">
                <Image
                  src={`/homepage/rules/${item.img}.png`}
                  alt={item.label}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="h-20 w-20 object-contain"
                />
                <span className="text-xs font-bold uppercase tracking-wide text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-white/80">{t("senderOutro")}</p>

          {/* Section 3 — National Kudos */}
          <h3 className="mt-10 text-2xl font-bold text-[#FFEA9E]">
            {t("nationalHeading")}
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/80">{t("nationalBody")}</p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-4 border-t border-white/10 px-8 py-5 sm:px-12">
          <button
            type="button"
            onClick={onClose}
            className="flex h-14 items-center gap-2 rounded-lg border border-[#998C5F] px-6 font-bold text-white transition-colors hover:bg-white/10"
          >
            <CloseIcon size={20} />
            <span>{t("closeButton")}</span>
          </button>
          <button
            type="button"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-6 font-bold text-[#00101A] transition-colors hover:bg-[#FFE07A]"
          >
            <PenIcon size={20} />
            <span>{t("writeKudosButton")}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

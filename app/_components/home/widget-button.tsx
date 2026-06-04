"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Floating quick-action widget (spec item 6): fixed gold pill at the bottom
 * right that toggles a small menu of quick actions (ID-54). The action targets
 * are placeholders until those features land.
 */
export default function WidgetButton() {
  const t = useTranslations("home.widget");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="menu"
          className="flex flex-col overflow-hidden rounded-xl border border-[#998C5F] bg-[#00070C] py-2 text-sm text-white shadow-lg"
        >
          <button type="button" role="menuitem" className="px-5 py-3 text-left transition-colors hover:bg-[#FFEA9E]/10">
            {t("writeKudos")}
          </button>
          <button type="button" role="menuitem" className="px-5 py-3 text-left transition-colors hover:bg-[#FFEA9E]/10">
            {t("rules")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        className="flex h-16 items-center gap-2 rounded-full bg-[#FFEA9E] px-4 text-[#00101A] transition-transform hover:scale-105"
        style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287" }}
      >
        <span className="flex items-center gap-2 text-2xl font-bold">
          <PenIcon />
          <span aria-hidden>/</span>
        </span>
        <Image src="/homepage/icon-kudos-logo.svg" alt="" width={24} height={23} aria-hidden />
      </button>
    </div>
  );
}

function PenIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
        fill="#00101A"
      />
    </svg>
  );
}

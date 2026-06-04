"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { LanguageDropdown } from "./language-dropdown";
import { setLocale } from "@/app/actions/locale";

type Lang = "vi" | "en";

/**
 * Header language switcher — interactive client island.
 * Renders the closed switcher button and toggles the LanguageDropdown.
 * Current language comes from next-intl; selecting one persists it via the
 * `setLocale` server action (cookie) and revalidates the layout.
 */
export default function LanguageSwitcher() {
  const locale = useLocale() as Lang;
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const flagSrc = locale === "vi" ? "/login/flag-vn.svg" : "/login/flag-en.svg";
  const label = locale === "vi" ? "VN" : "EN";

  function handleSelect(lang: Lang) {
    setOpen(false);
    if (lang !== locale) {
      startTransition(() => {
        void setLocale(lang);
      });
    }
  }

  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Current language: ${label}. Click to change.`}
        className="flex flex-row items-center gap-4 cursor-pointer"
        style={{ height: "56px" }}
      >
        <Image
          src={flagSrc}
          alt={locale === "vi" ? "Vietnam flag" : "UK flag"}
          width={24}
          height={24}
        />
        <span className="text-white text-sm font-medium select-none">{label}</span>
        <Image
          src="/login/chevron-down.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 z-50"
            style={{ top: "calc(100% + 8px)" }}
          >
            <LanguageDropdown current={locale} onSelect={handleSelect} open />
          </div>
        </>
      )}
    </div>
  );
}

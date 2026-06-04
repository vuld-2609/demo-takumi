"use client";

import Image from "next/image";
import type { JSX } from "react";

type Lang = "vi" | "en";

interface LanguageDropdownProps {
  current: Lang;
  onSelect: (lang: Lang) => void;
  open?: boolean;
}

interface LangOption {
  lang: Lang;
  label: string;
  flag: string;
  justify: "flex-start" | "center";
}

const LANG_OPTIONS: LangOption[] = [
  { lang: "vi", label: "VN", flag: "/login/flag-vn.svg", justify: "flex-start" },
  { lang: "en", label: "EN", flag: "/login/flag-en.svg", justify: "center" },
];

export function LanguageDropdown({
  current,
  onSelect,
  open = true,
}: LanguageDropdownProps): JSX.Element {
  if (!open) return <></>;

  return (
    <div
      style={{
        backgroundColor: "#00070C",
        border: "1px solid #998C5F",
        borderRadius: "8px",
        padding: "6px",
        display: "flex",
        flexDirection: "column",
        width: "122px",
      }}
    >
      {LANG_OPTIONS.map(({ lang, label, flag, justify }) => {
        const isSelected = current === lang;

        return (
          <button
            key={lang}
            type="button"
            onClick={() => onSelect(lang)}
            style={{
              width: "100%",
              height: "56px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: justify,
              borderRadius: "2px",
              backgroundColor: isSelected
                ? "rgba(255,234,158,0.20)"
                : "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 8px",
              gap: "8px",
              color: "#FFFFFF",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,234,158,0.10)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
              }
            }}
          >
            <Image
              src={flag}
              alt={label}
              width={24}
              height={24}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

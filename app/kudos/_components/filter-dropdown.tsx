"use client";

/**
 * FilterDropdown — single-select dropdown pill for Hashtag / Phòng ban filters.
 * Trigger: dark pill with label + current value + ChevronDown.
 * Menu: dark rounded panel, active option has gold-glow highlight.
 * Closes on outside-click and Escape key.
 * Props: label, options, value (null = "All"), onChange callback.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/app/_components/home/icons";
import type { FilterOption } from "@/lib/kudos/types";

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const t = useTranslations("kudos");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const displayLabel = value ?? label;
  const isFiltered = value !== null;

  function select(v: string | null) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F]"
        style={{
          backgroundColor: isFiltered ? "#1A1400" : "#0B0B0B",
          border: `1px solid ${isFiltered ? "#FFEA9E" : "#2E3940"}`,
          color: isFiltered ? "#FFEA9E" : "rgba(255,255,255,0.8)",
        }}
      >
        <span>{displayLabel}</span>
        <ChevronDownIcon
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl py-1 shadow-2xl"
          style={{
            backgroundColor: "#0B0B0B",
            border: "1px solid #998C5F",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          }}
        >
          {/* "All" / clear row */}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => select(null)}
              className="flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{
                color: value === null ? "#FFEA9E" : "rgba(255,255,255,0.7)",
                fontWeight: value === null ? 700 : 400,
                background: value === null ? "rgba(255,234,158,0.06)" : undefined,
              }}
            >
              {t("filterAll")}
            </button>
          </li>

          {options.map((opt) => {
            const active = value === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(opt.value)}
                  className="flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{
                    color: active ? "#FFEA9E" : "rgba(255,255,255,0.8)",
                    fontWeight: active ? 700 : 400,
                    background: active ? "rgba(255,234,158,0.08)" : undefined,
                    textShadow: active ? "0 0 6px #FAE287" : undefined,
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

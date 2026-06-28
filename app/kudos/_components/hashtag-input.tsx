"use client";

/**
 * HashtagInput — chip-based hashtag field.
 * - Chips display with leading "#" and an "×" remove button.
 * - "+ Hashtag" button (with "Tối đa 5" note) opens a DARK dropdown panel.
 * - Dropdown lists suggestions; selected rows show a filled-circle checkmark.
 * - Clicking a row toggles selection (add if <5, remove if already selected).
 * - Free-text entry + Enter adds a custom tag.
 * - At 5 tags the add button is hidden; a "Tối đa 5 hashtag" note appears.
 */

import { useEffect, useRef, useState } from "react";
import { PlusIcon, CloseIcon } from "@/app/_components/home/icons";

const MAX_TAGS = 5;

interface HashtagInputProps {
  suggestions: string[];
  tags: string[];
  onChange: (tags: string[]) => void;
  hasError?: boolean;
}

function CheckCircleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="9" fill="#FFEA9E" />
      <path d="M5 9.5L7.5 12L13 6.5" stroke="#1A1200" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HashtagInput({
  suggestions,
  tags,
  onChange,
  hasError = false,
}: HashtagInputProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function normalize(s: string) { return s.replace(/^#+/, "").trim(); }

  function addTag(raw: string) {
    const clean = normalize(raw);
    if (!clean) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.map((t) => t.toLowerCase()).includes(clean.toLowerCase())) return;
    onChange([...tags, clean]);
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function toggleSuggestion(s: string) {
    const already = tags.map((t) => t.toLowerCase()).includes(s.toLowerCase());
    if (already) {
      removeTag(tags.find((t) => t.toLowerCase() === s.toLowerCase()) ?? s);
    } else {
      addTag(s);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tags.length < MAX_TAGS) {
        addTag(inputVal);
        setInputVal("");
      }
    }
  }

  const atMax = tags.length >= MAX_TAGS;
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2">
      {/* Chips */}
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
          style={{ background: "#E8E0C8", color: "#3D3010" }}
        >
          #{tag}
          <button
            type="button"
            aria-label={`Xóa hashtag ${tag}`}
            onClick={() => removeTag(tag)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#998C5F]"
          >
            <CloseIcon size={12} />
          </button>
        </span>
      ))}

      {/* Add button — hidden when at max */}
      {!atMax && (
        <div className="relative">
          <div className="flex flex-col items-start gap-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen((o) => !o);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[#FFFAE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
              style={{
                borderColor: hasError ? "#D4271D" : "#998C5F",
                color: "#3D3010",
              }}
            >
              <PlusIcon size={14} />
              Hashtag
            </button>
            <span className="pl-1 text-xs text-gray-400">Tối đa {MAX_TAGS}</span>
          </div>

          {open && (
            <div
              className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl shadow-xl"
              style={{ background: "#111111", border: "1px solid #2A2A2A" }}
            >
              {/* Free-text entry */}
              <div className="border-b px-3 py-2.5" style={{ borderColor: "#2A2A2A" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập hashtag..."
                  maxLength={40}
                  disabled={atMax}
                  className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none disabled:opacity-40"
                />
              </div>

              {/* Suggestions list */}
              {suggestions.length > 0 && (
                <ul className="max-h-48 overflow-auto py-1">
                  {suggestions.map((s) => {
                    const selected = tagSet.has(s.toLowerCase());
                    const disabled = !selected && atMax;
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          disabled={disabled}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!disabled) toggleSuggestion(s);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-40"
                          style={{
                            color: selected ? "#FFEA9E" : "#E5E5E5",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "#1E1E1E";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          }}
                        >
                          <span>#{s}</span>
                          {selected && <CheckCircleIcon />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {atMax && (
                <p className="px-4 py-2 text-xs" style={{ color: "#888" }}>
                  Tối đa 5 hashtag
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {atMax && (
        <span className="text-xs text-gray-500">Tối đa {MAX_TAGS} hashtag</span>
      )}
    </div>
  );
}

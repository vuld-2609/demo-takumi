"use client";

/**
 * HashtagInput — chip-based hashtag field.
 * - Shows a "+ Hashtag" button that opens a dropdown of suggestions + free-text entry.
 * - Added tags render as chips with × remove button.
 * - Min 1, max 5. At 5 the add button is hidden.
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

  function addTag(tag: string) {
    const clean = tag.replace(/^#+/, "").trim();
    if (!clean) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.map((t) => t.toLowerCase()).includes(clean.toLowerCase())) return;
    onChange([...tags, clean]);
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleSuggestionClick(s: string) {
    addTag(s);
    setOpen(false);
    setInputVal("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputVal);
      setInputVal("");
    }
  }

  const remaining = MAX_TAGS - tags.length;
  const filteredSuggestions = suggestions.filter(
    (s) => !tags.map((t) => t.toLowerCase()).includes(s.toLowerCase()),
  );

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
      {tags.length < MAX_TAGS && (
        <div className="relative">
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
            <span className="text-xs text-gray-400">Tối đa {MAX_TAGS}</span>
          </button>

          {open && (
            <div
              className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-[#998C5F] bg-white shadow-lg"
            >
              {/* Free-text entry */}
              <div className="border-b border-[#E5DFC8] px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập hashtag..."
                  maxLength={40}
                  className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                />
              </div>

              {/* Suggestions */}
              {filteredSuggestions.length > 0 && (
                <ul className="max-h-40 overflow-auto py-1">
                  {filteredSuggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(s);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#FFFAE8]"
                      >
                        #{s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {remaining <= 2 && remaining > 0 && (
                <p className="px-3 py-1.5 text-xs text-gray-400">
                  Còn {remaining} hashtag
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tags.length >= MAX_TAGS && (
        <span className="text-xs text-gray-500">Tối đa {MAX_TAGS} hashtag</span>
      )}
    </div>
  );
}

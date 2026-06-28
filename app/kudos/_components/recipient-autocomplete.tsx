"use client";

/**
 * RecipientAutocomplete — search input that filters a list of receivers and
 * lets the user pick one. Shows a DARK dropdown on focus/typing with circular
 * avatar, bold display name, and muted rank. Has a chevron on the right of the
 * light input. Controlled: calls onSelect with the chosen Receiver.
 *
 * NOTE: The parent (ComposeDialog) passes a changing `key` each time the modal
 * opens, so remounting handles field reset — no setState-in-effect needed.
 */

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@/app/_components/home/icons";

export interface Receiver {
  id: string;
  displayName: string;
  avatarUrl?: string;
  rank?: string;
}

interface RecipientAutocompleteProps {
  options: Receiver[];
  value: Receiver | null;
  onSelect: (r: Receiver | null) => void;
  placeholder?: string;
  hasError?: boolean;
  /** If provided, the field is pre-filled and read-only. */
  preselected?: Receiver;
}

function AvatarCircle({ avatarUrl, displayName }: { avatarUrl?: string; displayName: string }) {
  const initials = displayName
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      <span className="relative shrink-0 h-8 w-8 overflow-hidden rounded-full">
        <Image src={avatarUrl} alt={displayName} fill sizes="32px" className="object-cover" />
      </span>
    );
  }
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: "#3A3320", color: "#FFEA9E" }}
    >
      {initials}
    </span>
  );
}

export default function RecipientAutocomplete({
  options,
  value,
  onSelect,
  placeholder = "Tìm kiếm",
  hasError = false,
  preselected,
}: RecipientAutocompleteProps) {
  const [query, setQuery] = useState(preselected?.displayName ?? value?.displayName ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.displayName.toLowerCase().includes(query.toLowerCase()))
    : options;

  function handleSelect(r: Receiver) {
    onSelect(r);
    setQuery(r.displayName);
    setOpen(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSelect(null);
    setOpen(true);
  }

  const borderColor = hasError ? "#D4271D" : "#998C5F";

  if (preselected) {
    return (
      <div
        className="flex h-14 items-center rounded-lg px-4 text-sm text-gray-700"
        style={{ background: "#fff", border: `1px solid ${borderColor}` }}
      >
        {preselected.displayName}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex h-14 items-center rounded-lg px-4"
        style={{ background: "#fff", border: `1px solid ${borderColor}` }}
      >
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
        />
        <ChevronDownIcon size={18} className="shrink-0 text-gray-500" />
      </div>

      {open && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-auto rounded-xl shadow-xl"
          style={{
            maxHeight: 260,
            background: "#111111",
            border: "1px solid #2A2A2A",
          }}
        >
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={value?.id === r.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur before select
                  handleSelect(r);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors focus:outline-none"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#1E1E1E";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <AvatarCircle avatarUrl={r.avatarUrl} displayName={r.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "#F0F0F0" }}>
                    {r.displayName}
                  </p>
                  {r.rank && (
                    <p className="truncate text-xs" style={{ color: "#888" }}>
                      {r.rank}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

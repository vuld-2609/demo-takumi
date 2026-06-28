"use client";

/**
 * RecipientAutocomplete — search input that filters a list of receivers and
 * lets the user pick one. Shows a dropdown on focus/typing. Has a chevron icon
 * on the right. Controlled: calls onSelect with the chosen Receiver.
 *
 * NOTE: The parent (ComposeDialog) passes a changing `key` each time the modal
 * opens, so remounting handles field reset — no setState-in-effect needed.
 */

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/app/_components/home/icons";

export interface Receiver {
  id: string;
  displayName: string;
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

export default function RecipientAutocomplete({
  options,
  value,
  onSelect,
  placeholder = "Tìm kiếm",
  hasError = false,
  preselected,
}: RecipientAutocompleteProps) {
  // Initialise once from props; parent remounts via `key` to reset.
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
    ? options.filter((o) =>
        o.displayName.toLowerCase().includes(query.toLowerCase()),
      )
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
          className="absolute z-50 mt-1 w-full overflow-auto rounded-lg border border-[#998C5F] bg-white shadow-lg"
          style={{ maxHeight: 220 }}
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
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#FFFAE8] focus:bg-[#FFFAE8] focus:outline-none"
              >
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

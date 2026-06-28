"use client";

/**
 * LinkInsertDialog — small modal for inserting a hyperlink into the rich-text editor.
 * Title: "Thêm đường dẫn". Fields: "Nội dung" (link text) + "URL".
 * Buttons: "Hủy" (outlined + × icon) and "Lưu" (yellow #FFEA9E + link icon).
 * Light/cream theme matching the Viết Kudo modal body.
 */

import { useEffect, useRef, useState } from "react";
import { CloseIcon, LinkIcon } from "@/app/_components/home/icons";

interface LinkInsertDialogProps {
  /** Initial text selection — pre-fills the "Nội dung" field. */
  initialText?: string;
  onSave: (url: string, text: string) => void;
  onClose: () => void;
}

export default function LinkInsertDialog({ initialText = "", onSave, onClose }: LinkInsertDialogProps) {
  const [linkText, setLinkText] = useState(initialText);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus URL field on mount
  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    if (!url.trim()) { setUrlError(true); urlInputRef.current?.focus(); return; }
    const effectiveText = linkText.trim() || url.trim();
    onSave(url.trim(), effectiveText);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-dialog-title"
        className="w-full max-w-sm rounded-2xl px-6 py-6 shadow-2xl"
        style={{ background: "#FFFAE8", border: "1px solid #E5DFC8" }}
      >
        <h3
          id="link-dialog-title"
          className="mb-5 text-center text-base font-bold text-gray-900"
        >
          Thêm đường dẫn
        </h3>

        <div className="flex flex-col gap-4">
          {/* Nội dung (link text) */}
          <div className="flex flex-col gap-1">
            <label htmlFor="link-text" className="text-xs font-semibold text-gray-700">
              Nội dung
            </label>
            <input
              id="link-text"
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Nội dung hiển thị"
              className="h-10 w-full rounded-lg border border-[#998C5F] bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#998C5F]"
            />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1">
            <label htmlFor="link-url" className="text-xs font-semibold text-gray-700">
              URL
            </label>
            <input
              id="link-url"
              ref={urlInputRef}
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder="https://..."
              className="h-10 w-full rounded-lg px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#998C5F]"
              style={{
                background: "#fff",
                border: `1px solid ${urlError ? "#D4271D" : "#998C5F"}`,
              }}
            />
            {urlError && (
              <p className="text-xs text-red-500">Vui lòng nhập URL</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#F0E8CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
            style={{ borderColor: "#998C5F" }}
          >
            Hủy <CloseIcon size={14} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2"
            style={{ backgroundColor: "#FFEA9E", color: "#1A1200" }}
          >
            Lưu <LinkIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

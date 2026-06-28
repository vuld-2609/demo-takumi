"use client";

/**
 * CopyLinkButton — copies `/kudos?k={kudosId}` to clipboard, then shows a
 * transient local toast (kudos.linkCopied) for ~2.5s at the bottom-center
 * of the viewport. Fade-in / fade-out via CSS opacity transition.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { CopyLinkIcon } from "@/app/_components/home/icons";

interface CopyLinkButtonProps {
  kudosId: string;
  /** Optional override for text/icon color (default white/60). */
  colorClass?: string;
}

export default function CopyLinkButton({ kudosId, colorClass }: CopyLinkButtonProps) {
  const t = useTranslations("kudos");
  const [toastVisible, setToastVisible] = useState(false);
  // Portal renders only after mount so server and first client render match
  // (avoids hydration mismatch from document-only rendering).
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  async function handleCopy() {
    const url = `${window.location.origin}/kudos?k=${kudosId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* Fallback for older browsers / non-HTTPS */
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    /* Show toast */
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={t("copyLink")}
        className={`flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F] ${colorClass ?? "text-white/60"}`}
      >
        <CopyLinkIcon size={18} />
        <span>{t("copyLink")}</span>
      </button>

      {/* Toast portal — rendered at document.body so it sits above everything */}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed bottom-8 left-1/2 z-[9999] -translate-x-1/2 transition-opacity duration-300"
            style={{ opacity: toastVisible ? 1 : 0 }}
          >
            <div
              className="rounded-full px-5 py-2.5 text-sm font-medium shadow-xl"
              style={{
                backgroundColor: "#0B0B0B",
                border: "1px solid #998C5F",
                color: "#FFEA9E",
                boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {t("linkCopied")}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

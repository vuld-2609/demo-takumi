/**
 * KudoMessageBox — shared nested body for board cards (post + highlight).
 * Renders the "Danh hiệu" title heading (if any) and the rich-text message.
 *
 * The message is sanitized HTML produced by the compose editor. It is sanitized
 * again here (defense in depth) before being injected, so even legacy/unsanitized
 * rows cannot inject script. Styling for the allowed inline tags lives in the
 * `kudo-rich` class (globals.css).
 */

import { sanitizeKudoHtml } from "@/lib/kudos/sanitize-html";

interface KudoMessageBoxProps {
  title: string;
  messageHtml: string;
  /** Line-clamp class for the body, e.g. "line-clamp-5" (post) or "line-clamp-3" (highlight). */
  clampClass: string;
  /** Inner padding — slightly larger on the wide post card. */
  pad?: "sm" | "md";
}

export default function KudoMessageBox({
  title,
  messageHtml,
  clampClass,
  pad = "md",
}: KudoMessageBoxProps) {
  const html = sanitizeKudoHtml(messageHtml);
  return (
    <div
      className={`rounded-xl ${pad === "md" ? "px-5 py-4" : "px-4 py-3"}`}
      style={{ backgroundColor: "#FFFDF5", border: "1px solid #EFE3BE" }}
    >
      {title && (
        <p className="m-0 mb-2 text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
          {title}
        </p>
      )}
      <div
        className={`kudo-rich ${clampClass} m-0 text-sm font-semibold leading-6 text-[#1A1A1A]`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

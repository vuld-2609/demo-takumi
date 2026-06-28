"use client";

/**
 * ComposeDialog — modal dialog for writing a kudos (section A compose flow).
 * Fields: receiver select (if receivers[] provided) or preselected display,
 * message textarea (required), hashtags text input (split on whitespace).
 * Submit calls createKudos server action; shows error on failure, closes on success.
 * Traps focus, closes on Esc and backdrop click.
 * Props: open, onClose, receiver? (preselected), receivers? (list to pick from).
 */

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/app/_components/home/icons";
import { createKudos } from "@/app/actions/kudos";

interface Receiver {
  id: string;
  displayName: string;
}

interface ComposeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected single receiver (e.g. from "Gửi KUDO" hover card button). */
  receiver?: Receiver;
  /** Optional list for a receiver picker select element. */
  receivers?: Receiver[];
}

export default function ComposeDialog({
  open,
  onClose,
  receiver,
  receivers,
}: ComposeDialogProps) {
  const t = useTranslations("kudos");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedReceiverId, setSelectedReceiverId] = useState<string>(
    receiver?.id ?? "",
  );
  const [message, setMessage] = useState("");
  const [hashtagsRaw, setHashtagsRaw] = useState("");
  const [showRequired, setShowRequired] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  /* Move focus to the close button on open. Field state is reset by remounting
   * (the parent passes a changing `key` each time the dialog opens), so no
   * setState-in-effect is needed here. */
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  /* Clear the success auto-close timer if the dialog unmounts first. */
  useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Trap focus within dialog */
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [open]);

  if (!open) return null;

  const effectiveReceiverId = receiver?.id ?? selectedReceiverId;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setShowRequired(true);
      return;
    }
    if (!effectiveReceiverId) {
      setShowRequired(true);
      return;
    }
    setShowRequired(false);
    setErrorMsg(null);

    const hashtags = hashtagsRaw
      .split(/\s+/)
      .map((h) => h.replace(/^#/, "").trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        const result = await createKudos({
          receiverId: effectiveReceiverId,
          message: message.trim(),
          hashtags,
        });
        if (result.ok) {
          setSuccess(true);
          successTimer.current = setTimeout(() => onClose(), 1200);
        } else {
          setErrorMsg(t("compose.error"));
        }
      } catch {
        setErrorMsg(t("compose.error"));
      }
    });
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-dialog-title"
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl p-7 shadow-2xl"
        style={{
          backgroundColor: "#0B0B0B",
          border: "1px solid #998C5F",
          boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="compose-dialog-title"
            className="m-0 text-lg font-bold text-[#FFEA9E]"
            style={{ textShadow: "0 0 6px #FAE287" }}
          >
            {t("compose.title")}
          </h2>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#998C5F]"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <p className="text-center text-sm font-medium text-green-400">
            {t("compose.success")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Receiver */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="compose-receiver"
                className="text-xs font-semibold uppercase tracking-wide text-white/60"
              >
                {t("compose.receiver")}
              </label>

              {receiver ? (
                /* Preselected — read-only display */
                <div
                  className="rounded-xl px-4 py-2.5 text-sm text-white/80"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2E3940" }}
                >
                  {receiver.displayName}
                </div>
              ) : receivers && receivers.length > 0 ? (
                /* Picker select */
                <select
                  id="compose-receiver"
                  value={selectedReceiverId}
                  onChange={(e) => setSelectedReceiverId(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#998C5F]"
                  style={{
                    backgroundColor: "#1A1A1A",
                    border: `1px solid ${showRequired && !selectedReceiverId ? "#D4271D" : "#2E3940"}`,
                  }}
                >
                  <option value="">{t("compose.receiverPlaceholder")}</option>
                  {receivers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.displayName}
                    </option>
                  ))}
                </select>
              ) : (
                /* No list, no preselect — show placeholder note */
                <div
                  className="rounded-xl px-4 py-2.5 text-sm text-white/40 italic"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2E3940" }}
                >
                  {t("compose.receiverPlaceholder")}
                </div>
              )}

              {showRequired && !effectiveReceiverId && (
                <p className="m-0 text-xs text-[#D4271D]">{t("compose.required")}</p>
              )}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="compose-message"
                className="text-xs font-semibold uppercase tracking-wide text-white/60"
              >
                {t("compose.message")}
              </label>
              <textarea
                id="compose-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("compose.messagePlaceholder")}
                className="resize-none rounded-xl px-4 py-3 text-sm text-white/85 placeholder:text-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#998C5F]"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: `1px solid ${showRequired && !message.trim() ? "#D4271D" : "#2E3940"}`,
                }}
              />
              {showRequired && !message.trim() && (
                <p className="m-0 text-xs text-[#D4271D]">{t("compose.required")}</p>
              )}
            </div>

            {/* Hashtags */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="compose-hashtags"
                className="text-xs font-semibold uppercase tracking-wide text-white/60"
              >
                {t("compose.hashtags")}
              </label>
              <input
                id="compose-hashtags"
                type="text"
                value={hashtagsRaw}
                onChange={(e) => setHashtagsRaw(e.target.value)}
                placeholder={t("compose.hashtagsPlaceholder")}
                className="rounded-xl px-4 py-2.5 text-sm text-white/85 placeholder:text-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#998C5F]"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #2E3940" }}
              />
            </div>

            {/* Server error */}
            {errorMsg && (
              <p className="m-0 text-sm text-[#D4271D]">{errorMsg}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#998C5F]"
              >
                {t("compose.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
                style={{ backgroundColor: "#FFEA9E", color: "#00101A" }}
              >
                {isPending ? "…" : t("compose.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

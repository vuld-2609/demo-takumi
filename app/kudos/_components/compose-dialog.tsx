"use client";

/**
 * ComposeDialog — "Viết Kudo" modal (light/cream MoMorph design).
 * Handles a11y (focus trap, Escape, backdrop click), submit flow, and
 * delegates form fields to ComposeForm.
 *
 * Backward-compatible with the existing call site in kudos-board.tsx:
 *   open, onClose, receiver?, receivers?
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { CloseIcon, SendIcon } from "@/app/_components/home/icons";
import type { MentionableUser } from "@/lib/kudos/types";
import type { Receiver } from "./recipient-autocomplete";
import ComposeForm, { type ComposeFormState } from "./compose-form";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface KudosSubmitPayload {
  receiverId: string;
  title: string;
  messageHtml: string;
  hashtags: string[];
  images: File[];
  isAnonymous: boolean;
  anonymousName: string;
}

export interface ComposeDialogProps {
  open: boolean;
  onClose: () => void;
  receiver?: Receiver;
  receivers?: Receiver[];
  mentionableUsers?: MentionableUser[];
  hashtagSuggestions?: string[];
  onSubmit?: (payload: KudosSubmitPayload) => Promise<{ ok: boolean }>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_MENTION_USERS: MentionableUser[] = [
  { id: "m1", displayName: "Nguyễn Văn An" },
  { id: "m2", displayName: "Trần Thị Bình" },
  { id: "m3", displayName: "Lê Minh Cường" },
  { id: "m4", displayName: "Phạm Thu Hà" },
];
const DEFAULT_HASHTAGS = ["TeamWork", "Helpful", "GoExtra", "Reliable", "Innovative"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function stubSubmit(_p: KudosSubmitPayload): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}

function initState(receiver?: Receiver): ComposeFormState {
  return {
    selectedReceiver: receiver ?? null,
    title: "",
    messageHtml: "",
    hashtags: [],
    images: [],
    isAnonymous: false,
    anonymousName: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComposeDialog({
  open,
  onClose,
  receiver,
  receivers = [],
  mentionableUsers = DEFAULT_MENTION_USERS,
  hashtagSuggestions = DEFAULT_HASHTAGS,
  onSubmit = stubSubmit,
}: ComposeDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formState, setFormState] = useState<ComposeFormState>(() => initState(receiver));
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof ComposeFormState>(key: K, val: ComposeFormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: val }));
  }

  // Focus first button on open
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[contenteditable],[tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [open]);

  // Cleanup success auto-close
  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current); }, []);

  if (!open) return null;

  const effectiveReceiver = receiver ?? formState.selectedReceiver;
  const plainText = formState.messageHtml.replace(/<[^>]*>/g, "").trim();
  const isFormValid =
    !!effectiveReceiver &&
    formState.title.trim().length > 0 &&
    plainText.length > 0 &&
    formState.hashtags.length >= 1 &&
    (!formState.isAnonymous || formState.anonymousName.trim().length > 0);

  function handleSubmit() {
    if (!isFormValid) { setShowErrors(true); return; }
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await onSubmit({
          receiverId: effectiveReceiver!.id,
          title: formState.title.trim(),
          messageHtml: formState.messageHtml,
          hashtags: formState.hashtags,
          images: formState.images,
          isAnonymous: formState.isAnonymous,
          anonymousName: formState.anonymousName.trim(),
        });
        if (result.ok) {
          setSuccess(true);
          successTimer.current = setTimeout(() => onClose(), 1400);
        } else {
          setServerError("Không gửi được Kudo. Vui lòng thử lại.");
        }
      } catch {
        setServerError("Không gửi được Kudo. Vui lòng thử lại.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-dialog-title"
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: "#FFFAE8", maxHeight: "90vh" }}
      >
        {/* Scrollable body */}
        <div className="flex flex-col gap-6 overflow-y-auto px-8 py-8">
          {/* Header */}
          <div className="relative flex items-start justify-center">
            <h2
              id="compose-dialog-title"
              className="max-w-xs text-center text-2xl font-bold leading-snug text-gray-900"
            >
              Gửi lời cám ơn và ghi nhận đến đồng đội
            </h2>
            <button
              ref={firstFocusRef}
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-0 top-0 rounded-lg p-1 text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {success ? (
            <p className="text-center text-base font-semibold text-green-600">
              Đã gửi Kudo thành công!
            </p>
          ) : (
            <ComposeForm
              state={formState}
              onChange={setField}
              showErrors={showErrors}
              serverError={serverError}
              effectiveReceiver={effectiveReceiver}
              plainText={plainText}
              receivers={receivers}
              mentionableUsers={mentionableUsers}
              hashtagSuggestions={hashtagSuggestions}
              preselected={receiver}
            />
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div
            className="flex gap-3 px-8 py-5"
            style={{ borderTop: "1px solid #E5DFC8", background: "#FFFAE8" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-[#F0E8CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
              style={{ borderColor: "#998C5F" }}
            >
              Hủy <CloseIcon size={16} />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-2"
              style={{ backgroundColor: "#FFEA9E", color: "#1A1200" }}
            >
              {isPending ? "Đang gửi…" : "Gửi"}
              {!isPending && <SendIcon size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

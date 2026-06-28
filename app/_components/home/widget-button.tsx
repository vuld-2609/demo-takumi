"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import RulesModal from "./rules-modal";
import { CloseIcon, PenIcon } from "./icons";
import ComposeDialog, { type KudosSubmitPayload } from "@/app/kudos/_components/compose-dialog";
import { createKudos } from "@/app/actions/kudos";
import type { MentionableUser } from "@/lib/kudos/types";

/** Adapt the modal payload to the createKudos server action. */
async function submitKudos(p: KudosSubmitPayload): Promise<{ ok: boolean }> {
  const result = await createKudos({
    receiverId: p.receiverId,
    title: p.title,
    message: p.messageHtml,
    hashtags: p.hashtags,
    images: p.images,
    isAnonymous: p.isAnonymous,
    anonymousName: p.anonymousName,
  });
  return { ok: result.ok };
}

interface WidgetButtonProps {
  /** Recipient options + @mention targets (self already excluded server-side). */
  receivers?: MentionableUser[];
  /** Curated + in-use hashtag suggestions for the compose dropdown. */
  hashtagSuggestions?: string[];
}

/**
 * Floating quick-action widget (spec item 6 / FAB screens _hphd32jN2 +
 * Sv7DFwBw1h). Collapsed: a gold pill showing the pencil icon, a "/" and the
 * red Sun* logo. Click expands it into two cream pill options ("Thể lệ" and
 * "Viết KUDOS") with the trigger turning into a round red close button.
 * The action targets are placeholders until those features land.
 */
export default function WidgetButton({
  receivers = [],
  hashtagSuggestions = [],
}: WidgetButtonProps) {
  const t = useTranslations("home.widget");
  const [open, setOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  // Bumped on each open so ComposeDialog remounts with fresh field state.
  const [composeKey, setComposeKey] = useState(0);

  const openRules = () => {
    setRulesOpen(true);
    setOpen(false);
  };
  const closeRules = useCallback(() => setRulesOpen(false), []);

  const openCompose = () => {
    setComposeKey((k) => k + 1);
    setComposeOpen(true);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <RulesModal open={rulesOpen} onClose={closeRules} />
      <ComposeDialog
        key={composeKey}
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        receivers={receivers}
        mentionableUsers={receivers}
        hashtagSuggestions={hashtagSuggestions}
        onSubmit={submitKudos}
      />

      {open && (
        <div role="menu" className="flex flex-col items-end gap-3">
          {/* Order matches the design: "Thể lệ" on top, "Viết KUDOS" below. */}
          <OptionPill
            role="menuitem"
            label={t("rules")}
            onClick={openRules}
            icon={
              <Image src="/homepage/icon-kudos-logo.svg" alt="" width={24} height={23} aria-hidden />
            }
          />
          <OptionPill role="menuitem" label={t("writeKudos")} onClick={openCompose} icon={<PenIcon />} />
        </div>
      )}

      {open ? (
        // Expanded: the trigger becomes a round red close button.
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4271D] text-white transition-transform hover:scale-105"
          style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25)" }}
        >
          <CloseIcon />
        </button>
      ) : (
        // Collapsed: the gold quick-action pill.
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="menu"
          aria-expanded={false}
          aria-label={t("label")}
          className="flex h-16 items-center gap-2 rounded-full bg-[#FFEA9E] px-4 text-[#00101A] transition-transform hover:scale-105"
          style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287" }}
        >
          <span className="flex items-center gap-2 text-2xl font-bold">
            <PenIcon />
            <span aria-hidden>/</span>
          </span>
          <Image src="/homepage/icon-kudos-logo.svg" alt="" width={24} height={23} aria-hidden />
        </button>
      )}
    </div>
  );
}

/** A single cream pill quick-action option: icon on the left, bold label. */
function OptionPill({
  label,
  icon,
  role,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  role?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role={role}
      onClick={onClick}
      className="flex h-16 items-center gap-2 rounded-2xl bg-[#FFEA9E] px-6 text-base font-bold text-[#00101A] transition-shadow hover:shadow-lg"
      style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25)" }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

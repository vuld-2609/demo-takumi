"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import RulesModal from "./rules-modal";
import { CloseIcon, PenIcon } from "./icons";

/**
 * Floating quick-action widget (spec item 6 / FAB screens _hphd32jN2 +
 * Sv7DFwBw1h). Collapsed: a gold pill showing the pencil icon, a "/" and the
 * red Sun* logo. Click expands it into two cream pill options ("Thể lệ" and
 * "Viết KUDOS") with the trigger turning into a round red close button.
 * The action targets are placeholders until those features land.
 */
export default function WidgetButton() {
  const t = useTranslations("home.widget");
  const [open, setOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const openRules = () => {
    setRulesOpen(true);
    setOpen(false);
  };
  const closeRules = useCallback(() => setRulesOpen(false), []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <RulesModal open={rulesOpen} onClose={closeRules} />

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
          <OptionPill role="menuitem" label={t("writeKudos")} icon={<PenIcon />} />
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

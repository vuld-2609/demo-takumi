"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useNotifications } from "@/lib/notifications/use-notifications";
import type { NotificationFeed } from "@/lib/notifications/types";
import NotificationList from "./notification-list";

/**
 * Notification bell + dropdown panel (design: "Thông báo"). Controlled open
 * state is owned by HeaderControls so opening the bell closes the account menu
 * and shares the click-away overlay. Live updates come from useNotifications
 * (Supabase Realtime); `initial` is server-fetched for a correct first paint.
 */
export default function NotificationBell({
  profileId,
  initial,
  open,
  onToggle,
  onClose,
}: {
  profileId: string;
  initial: NotificationFeed;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("notifications");
  const tHeader = useTranslations("home.header");
  const { items, unread, markRead, markAllRead } = useNotifications(profileId, initial);

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tHeader("notifications")}
        className="relative flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-white/10"
      >
        <Image src="/homepage/icon-notification.svg" alt="" width={24} height={24} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-[#D4271D] px-1 text-[10px] font-bold leading-[18px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[#998C5F] bg-[#00070C] text-white shadow-2xl"
        >
          {/* Header: title + mark-all-read */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="m-0 text-base font-bold text-white">{t("title")}</h2>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className="text-xs font-medium text-[#FFEA9E] transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {t("markAllRead")}
            </button>
          </div>

          {/* Scrollable list */}
          <div className="max-h-[70vh] overflow-y-auto">
            <NotificationList items={items} onMarkRead={markRead} onActivated={onClose} />
          </div>

          {/* Footer: view all */}
          <Link
            href="/notifications"
            onClick={onClose}
            className="block border-t border-white/10 px-4 py-3 text-center text-sm font-medium text-[#FFEA9E] transition-colors hover:bg-white/[0.06]"
          >
            {t("viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatRelativeTime, type AppNotification } from "@/lib/notifications/types";
import { NotificationTypeIcon } from "./notification-icons";

/**
 * One notification row: type icon + message (with actor name) + relative time,
 * and a red unread dot. Unread rows get a subtly raised background.
 *
 * `nowMs` is passed from the parent (set after mount) so the relative time is
 * computed only on the client — the server render uses 0 and the span is marked
 * suppressHydrationWarning to avoid a mismatch.
 */
export default function NotificationItem({
  notification,
  nowMs,
  onActivate,
}: {
  notification: AppNotification;
  nowMs: number;
  onActivate: (n: AppNotification) => void;
}) {
  const t = useTranslations("notifications");
  const locale = useLocale() === "en" ? "en" : "vi";

  const actor = notification.actorName || t("anonymous");
  const message = t(`item.${notification.type}`, { name: actor });
  const time = nowMs ? formatRelativeTime(notification.createdAt, locale, nowMs) : "";

  return (
    <button
      type="button"
      onClick={() => onActivate(notification)}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06] ${
        notification.isRead ? "" : "bg-white/[0.03]"
      }`}
    >
      <span className="mt-0.5 shrink-0">
        <NotificationTypeIcon type={notification.type} size={22} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug text-white">{message}</span>
        <span className="mt-1 block text-xs text-white/40" suppressHydrationWarning>
          {time}
        </span>
      </span>

      {!notification.isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D4271D]" aria-label={t("unread")} />
      )}
    </button>
  );
}

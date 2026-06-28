"use client";

import { useTranslations } from "next-intl";
import { useNotifications } from "@/lib/notifications/use-notifications";
import type { NotificationFeed } from "@/lib/notifications/types";
import NotificationList from "@/app/_components/notifications/notification-list";

/**
 * Full "Tất cả thông báo" panel (design screen 2). Same realtime hook as the
 * bell, rendered as a centered card with the complete list + mark-all-read.
 */
export default function NotificationsClient({
  profileId,
  initial,
}: {
  profileId: string;
  initial: NotificationFeed;
}) {
  const t = useTranslations("notifications");
  const { items, unread, markRead, markAllRead } = useNotifications(profileId, initial);

  return (
    <section className="mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#998C5F] bg-[#00070C]/95 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h1 className="m-0 text-xl font-bold text-white">{t("title")}</h1>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unread === 0}
          className="text-sm font-medium text-[#FFEA9E] transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {t("markAllRead")}
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <NotificationList
          items={items}
          onMarkRead={markRead}
          emptyClassName="px-5 py-10 text-center text-sm text-white/40"
        />
      </div>
    </section>
  );
}

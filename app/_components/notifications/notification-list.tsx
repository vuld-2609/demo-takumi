"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AppNotification } from "@/lib/notifications/types";
import NotificationItem from "./notification-item";

/**
 * Shared scrollable list of notifications, used by both the bell dropdown and
 * the full "Tất cả thông báo" page. Owns the once-per-minute clock used for
 * relative times. Activating a row marks it read and routes to the kudos board.
 */
export default function NotificationList({
  items,
  onMarkRead,
  onActivated,
  emptyClassName = "px-4 py-6 text-sm text-white/40",
}: {
  items: AppNotification[];
  onMarkRead: (id: string) => void;
  /** Called after a row is activated — e.g. close the dropdown. */
  onActivated?: () => void;
  emptyClassName?: string;
}) {
  const t = useTranslations("notifications");
  const router = useRouter();
  // 0 until mounted so the SSR/first-paint relative time stays blank (no mismatch).
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    // Defer the first set out of the effect body (lint: no sync setState in
    // effects); time fills on the next tick and refreshes every minute.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  function activate(n: AppNotification) {
    if (!n.isRead) onMarkRead(n.id);
    onActivated?.();
    if (n.kudosId) router.push("/kudos");
  }

  if (items.length === 0) {
    return <p className={emptyClassName}>{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-white/10">
      {items.map((n) => (
        <li key={n.id}>
          <NotificationItem notification={n} nowMs={nowMs} onActivate={activate} />
        </li>
      ))}
    </ul>
  );
}

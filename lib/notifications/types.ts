// Domain types for in-app notifications. DB rows are snake_case; this camelCase
// shape is what the bell + "Tất cả thông báo" page consume (mapped in queries.ts).

/** The notification event kinds backed by real data today. */
export type NotificationType = "kudo_received" | "heart_received" | "mention_received";

/** One notification as rendered by the UI. */
export type AppNotification = {
  id: string;
  type: NotificationType;
  /** Display name of who triggered it; already anonymity-masked in queries.ts.
   * Null when the actor profile was deleted. */
  actorName: string | null;
  /** Related kudos id for navigation (→ /kudos). Null if the kudos was removed. */
  kudosId: string | null;
  isRead: boolean;
  /** ISO timestamp; render relative with formatRelativeTime(). */
  createdAt: string;
};

/** Payload returned to the client (list + unread count) on fetch/refresh. */
export type NotificationFeed = {
  items: AppNotification[];
  unread: number;
};

/** How many notifications the bell / page load at once. */
export const NOTIFICATIONS_PAGE_SIZE = 30;

/**
 * Format an ISO timestamp as a short relative label ("15 phút trước").
 * `nowMs` is injected so the caller controls the clock — pass a client-only
 * value (set after mount) to avoid SSR/client hydration mismatches.
 */
export function formatRelativeTime(
  iso: string,
  locale: "vi" | "en",
  nowMs: number,
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.floor((nowMs - then) / 1000));

  const vi = {
    now: "Vừa xong",
    min: (n: number) => `${n} phút trước`,
    hour: (n: number) => `${n} giờ trước`,
    day: (n: number) => `${n} ngày trước`,
    week: (n: number) => `${n} tuần trước`,
    month: (n: number) => `${n} tháng trước`,
    year: (n: number) => `${n} năm trước`,
  };
  const en = {
    now: "Just now",
    min: (n: number) => `${n}m ago`,
    hour: (n: number) => `${n}h ago`,
    day: (n: number) => `${n}d ago`,
    week: (n: number) => `${n}w ago`,
    month: (n: number) => `${n}mo ago`,
    year: (n: number) => `${n}y ago`,
  };
  const L = locale === "en" ? en : vi;

  if (sec < 60) return L.now;
  const min = Math.floor(sec / 60);
  if (min < 60) return L.min(min);
  const hour = Math.floor(min / 60);
  if (hour < 24) return L.hour(hour);
  const day = Math.floor(hour / 24);
  if (day < 7) return L.day(day);
  const week = Math.floor(day / 7);
  if (week < 5) return L.week(week);
  const month = Math.floor(day / 30);
  if (month < 12) return L.month(month);
  return L.year(Math.floor(day / 365));
}

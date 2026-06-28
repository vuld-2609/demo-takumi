import { createClient } from "@/lib/supabase/server";
import {
  NOTIFICATIONS_PAGE_SIZE,
  type AppNotification,
  type NotificationFeed,
  type NotificationType,
} from "./types";

// Embedded shapes returned by the notification join.
type EmbeddedActor = { display_name: string | null } | null;
type EmbeddedKudos = { is_anonymous: boolean | null; anonymous_name: string | null } | null;

/**
 * Resolve the actor display name, masking anonymous senders. For an anonymous
 * `kudo_received`, the real sender must never leak — we show the chosen alias
 * (or null → the UI renders a generic "ẩn danh" label). Hearts are never
 * anonymous, so the actor's name is shown as-is.
 */
function resolveActorName(
  type: NotificationType,
  actor: EmbeddedActor,
  kudos: EmbeddedKudos,
): string | null {
  // kudo_received and mention_received both have the kudos SENDER as actor, so
  // an anonymous kudos must mask their real name. heart_received's actor is the
  // hearter (never anonymous), so it is shown as-is.
  if ((type === "kudo_received" || type === "mention_received") && kudos?.is_anonymous) {
    return kudos.anonymous_name || null;
  }
  return actor?.display_name ?? null;
}

/**
 * Load the recipient's latest notifications (newest-first) plus the total
 * unread count. RLS guarantees only the recipient's own rows are returned.
 */
export async function getNotificationFeed(
  recipientProfileId: string,
  limit = NOTIFICATIONS_PAGE_SIZE,
): Promise<NotificationFeed> {
  const supabase = await createClient();

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select(
        `id, type, kudos_id, read_at, created_at,
         actor:profiles!notifications_actor_id_fkey(display_name),
         kudos:kudos!notifications_kudos_id_fkey(is_anonymous, anonymous_name)`,
      )
      .eq("recipient_id", recipientProfileId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", recipientProfileId)
      .is("read_at", null),
  ]);

  if (error || !data) {
    if (error) console.error("getNotificationFeed failed:", error.message);
    return { items: [], unread: 0 };
  }

  const items: AppNotification[] = data.map((row) => {
    const type = row.type as NotificationType;
    return {
      id: row.id as string,
      type,
      actorName: resolveActorName(
        type,
        row.actor as unknown as EmbeddedActor,
        row.kudos as unknown as EmbeddedKudos,
      ),
      kudosId: (row.kudos_id as string | null) ?? null,
      isRead: row.read_at != null,
      createdAt: row.created_at as string,
    };
  });

  return { items, unread: count ?? 0 };
}

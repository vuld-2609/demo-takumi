"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getViewerProfileId } from "@/lib/kudos/queries";
import { getNotificationFeed } from "@/lib/notifications/queries";
import type { NotificationFeed } from "@/lib/notifications/types";

const EMPTY_FEED: NotificationFeed = { items: [], unread: 0 };

/** Resolve the caller's own profile id, or null if unauthenticated / no profile. */
async function currentProfileId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getViewerProfileId(user.id);
}

/**
 * Fetch the current user's notification feed. Called on initial load (server)
 * and on every realtime event (from the client hook) to re-pull the list with
 * fresh actor/anonymity data that the raw realtime payload does not carry.
 */
export async function fetchNotifications(): Promise<NotificationFeed> {
  const profileId = await currentProfileId();
  if (!profileId) return EMPTY_FEED;
  return getNotificationFeed(profileId);
}

/** Mark a single notification read. RLS ensures it must be the caller's own. */
export async function markNotificationRead(id: string): Promise<{ ok: boolean }> {
  const profileId = await currentProfileId();
  if (!profileId) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", profileId)
    .is("read_at", null);

  if (error) {
    console.error("markNotificationRead failed:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

/** Mark every unread notification read ("Đánh dấu đọc tất cả"). */
export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  const profileId = await currentProfileId();
  if (!profileId) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", profileId)
    .is("read_at", null);

  if (error) {
    console.error("markAllNotificationsRead failed:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

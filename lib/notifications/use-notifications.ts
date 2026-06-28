"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import type { AppNotification, NotificationFeed } from "./types";

// Monotonic counter so every realtime subscription gets a globally-unique
// channel topic (see the Strict-Mode note in the effect below).
let channelSeq = 0;

/**
 * Realtime notification state for one user. Subscribes to Supabase Realtime
 * (`postgres_changes` on `public.notifications`, scoped to the recipient) and
 * re-pulls the feed via a server action on every INSERT/UPDATE — the raw
 * realtime row lacks the joined actor/anonymity data, so a server refetch keeps
 * the masking logic in one place.
 *
 * `initial` is fetched on the server so first paint is correct with no flash.
 */
export function useNotifications(profileId: string, initial: NotificationFeed) {
  const [items, setItems] = useState<AppNotification[]>(initial.items);
  const [unread, setUnread] = useState<number>(initial.unread);
  // Avoid overlapping refetches if events arrive in a burst.
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const feed = await fetchNotifications();
      setItems(feed.items);
      setUnread(feed.unread);
    } finally {
      refreshing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!profileId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // The notifications table has RLS, so Realtime only delivers rows this
      // user can SELECT — which requires the realtime socket to carry the user's
      // JWT. createBrowserClient hydrates its session from cookies async, so we
      // explicitly set the token BEFORE subscribing to avoid a race where the
      // socket connects as anon and RLS silently drops every event.
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (cancelled) return;
      if (token) supabase.realtime.setAuth(token);

      // Unique topic per effect run: createBrowserClient is a singleton, so its
      // channels are shared — reusing a subscribed channel throws "cannot add
      // postgres_changes callbacks after subscribe()" under React Strict Mode.
      channelSeq += 1;
      channel = supabase
        .channel(`notifications:${profileId}:${channelSeq}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${profileId}`,
          },
          () => {
            void refresh();
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [profileId, refresh]);

  /** Optimistically mark one read, then persist. */
  const markRead = useCallback(async (id: string) => {
    let wasUnread = false;
    setItems((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.isRead) wasUnread = true;
        return n.id === id ? { ...n, isRead: true } : n;
      }),
    );
    if (wasUnread) setUnread((u) => Math.max(0, u - 1));
    await markNotificationRead(id);
  }, []);

  /** Optimistically clear all, then persist. */
  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    await markAllNotificationsRead();
  }, []);

  return { items, unread, markRead, markAllRead, refresh };
}

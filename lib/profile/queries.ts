import { createClient } from "@/lib/supabase/server";
import {
  PLACEHOLDER_BOX_STATS,
  type KudosFilter,
  type KudosUser,
  type KudosWithUsers,
  type Profile,
  type ProfileStats,
} from "./types";

// Embedded profile shape returned by the kudos join.
type EmbeddedUser = {
  display_name: string | null;
  avatar_url: string | null;
  rank: string | null;
  hero_badge: KudosUser["heroBadge"];
};

const FALLBACK_AVATAR = "/profile/kudos-avatar-1.png";

function toUser(row: EmbeddedUser | null): KudosUser {
  return {
    displayName: row?.display_name ?? "Sunner",
    avatarUrl: row?.avatar_url || FALLBACK_AVATAR,
    rank: row?.rank ?? "",
    heroBadge: row?.hero_badge ?? null,
  };
}

/** The current user's profile, resolved from their auth user id. Null if none. */
export async function getProfileByAuthUser(authUserId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, rank, hero_badge")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    displayName: data.display_name ?? "Sunner",
    avatarUrl: data.avatar_url || FALLBACK_AVATAR,
    rank: data.rank ?? "",
    heroBadge: data.hero_badge ?? null,
  };
}

/**
 * Aggregate counts for the stats card. All three counts run as head-only
 * COUNT queries in parallel; hearts-received pushes the receiver filter into
 * the DB via an inner join (no client-side id list → scales past any size).
 * Box counts are placeholders (no backend feature).
 */
export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const supabase = await createClient();

  const [received, sent, hearts] = await Promise.all([
    supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", profileId),
    supabase
      .from("kudos")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", profileId),
    // Hearts received = reactions across the user's received kudos.
    supabase
      .from("kudos_hearts")
      .select("kudos!inner(receiver_id)", { count: "exact", head: true })
      .eq("kudos.receiver_id", profileId),
  ]);

  return {
    kudosReceived: received.count ?? 0,
    kudosSent: sent.count ?? 0,
    heartsReceived: hearts.count ?? 0,
    ...PLACEHOLDER_BOX_STATS,
  };
}

/** Kudos feed for the profile, filtered by direction, newest first. */
export async function getKudosFeed(
  profileId: string,
  filter: KudosFilter,
): Promise<KudosWithUsers[]> {
  const supabase = await createClient();
  const column = filter === "sent" ? "sender_id" : "receiver_id";

  const { data, error } = await supabase
    .from("kudos")
    .select(
      `id, message, images, hashtags, category, is_spam, created_at,
       sender:profiles!kudos_sender_id_fkey(display_name, avatar_url, rank, hero_badge),
       receiver:profiles!kudos_receiver_id_fkey(display_name, avatar_url, rank, hero_badge),
       kudos_hearts(count)`,
    )
    .eq(column, profileId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("getKudosFeed failed:", error.message);
    return [];
  }

  return data.map((row): KudosWithUsers => {
    // PostgREST returns the embedded aggregate count as a string — coerce it.
    const heartAgg = row.kudos_hearts as unknown as { count: number | string }[] | null;
    return {
      id: row.id,
      sender: toUser(row.sender as unknown as EmbeddedUser | null),
      receiver: toUser(row.receiver as unknown as EmbeddedUser | null),
      message: row.message ?? "",
      images: row.images ?? [],
      hashtags: row.hashtags ?? [],
      category: row.category ?? null,
      isSpam: row.is_spam ?? false,
      heartCount: Number(heartAgg?.[0]?.count ?? 0),
      createdAt: row.created_at,
    };
  });
}

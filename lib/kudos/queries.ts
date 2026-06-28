import { createClient } from "@/lib/supabase/server";
import { getProfileByAuthUser } from "@/lib/profile/queries";
import { PLACEHOLDER_BOX_STATS, type ProfileStats } from "@/lib/profile/types";
import {
  CURATED_HASHTAGS,
  type BoardKudos,
  type FilterOption,
  type HoverCardData,
  type KudosBoardUser,
  type LeaderboardEntry,
  type MentionableUser,
} from "./types";

const FALLBACK_AVATAR = "/profile/kudos-avatar-1.png";

// Embedded profile shape returned by the kudos join.
type EmbeddedUser = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  rank: string | null;
  department: string | null;
  hero_badge: KudosBoardUser["heroBadge"];
};

function toUser(row: EmbeddedUser | null): KudosBoardUser {
  return {
    id: row?.id ?? "",
    displayName: row?.display_name ?? "Sunner",
    avatarUrl: row?.avatar_url || FALLBACK_AVATAR,
    rank: row?.rank ?? "",
    department: row?.department ?? null,
    heroBadge: row?.hero_badge ?? null,
  };
}

/** Resolve the viewer's profile id from their auth user id (null if none). */
export async function getViewerProfileId(authUserId: string): Promise<string | null> {
  const profile = await getProfileByAuthUser(authUserId);
  return profile?.id ?? null;
}

/**
 * Fetch board kudos (excluding spam) filtered by hashtag and/or department
 * (department filters on the RECEIVER). Returns mapped BoardKudos with the
 * viewer's like state. The page derives Highlight (top-5 by hearts) and the
 * All-Kudos feed (newest-first) from this single list via the helpers below.
 */
export async function getFilteredKudos(
  viewerProfileId: string | null,
  filters: { hashtag?: string; department?: string },
): Promise<BoardKudos[]> {
  const supabase = await createClient();

  let query = supabase
    .from("kudos")
    .select(
      `id, title, message, images, hashtags, category, is_spam, is_anonymous, anonymous_name, created_at, sender_id, receiver_id,
       sender:profiles!kudos_sender_id_fkey!inner(id, display_name, avatar_url, rank, department, hero_badge),
       receiver:profiles!kudos_receiver_id_fkey!inner(id, display_name, avatar_url, rank, department, hero_badge),
       kudos_hearts(count)`,
    )
    .eq("is_spam", false);

  if (filters.hashtag) query = query.contains("hashtags", [filters.hashtag]);
  if (filters.department) query = query.eq("receiver.department", filters.department);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("getFilteredKudos failed:", error.message);
    return [];
  }

  // Which kudos has the viewer hearted? One small query, turned into a Set.
  let likedIds = new Set<string>();
  if (viewerProfileId) {
    const { data: hearts } = await supabase
      .from("kudos_hearts")
      .select("kudos_id")
      .eq("user_id", viewerProfileId);
    likedIds = new Set((hearts ?? []).map((h) => h.kudos_id as string));
  }

  return data.map((row): BoardKudos => {
    const heartAgg = row.kudos_hearts as unknown as { count: number | string }[] | null;
    const isAnonymous = Boolean(row.is_anonymous);
    // When anonymous, never leak the real sender to the client; show the chosen
    // alias (or a generic label) with no identifying rank/department/badge.
    const sender = isAnonymous
      ? toUser({
          id: "",
          display_name: row.anonymous_name || "Người ẩn danh",
          avatar_url: null,
          rank: null,
          department: null,
          hero_badge: null,
        })
      : toUser(row.sender as unknown as EmbeddedUser | null);
    return {
      id: row.id,
      sender,
      receiver: toUser(row.receiver as unknown as EmbeddedUser | null),
      title: row.title ?? "",
      message: row.message ?? "",
      images: row.images ?? [],
      hashtags: row.hashtags ?? [],
      isAnonymous,
      category: row.category ?? null,
      heartCount: Number(heartAgg?.[0]?.count ?? 0),
      likedByMe: likedIds.has(row.id),
      canLike: viewerProfileId != null && row.sender_id !== viewerProfileId,
      ownedByViewer: viewerProfileId != null && row.sender_id === viewerProfileId,
      createdAt: row.created_at,
    };
  });
}

/** Top-5 most-hearted (Highlight carousel). */
export function pickHighlight(all: BoardKudos[]): BoardKudos[] {
  return [...all].sort((a, b) => b.heartCount - a.heartCount).slice(0, 5);
}

/** Newest-first (All Kudos feed). */
export function sortFeed(all: BoardKudos[]): BoardKudos[] {
  return [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Distinct hashtags across all kudos, for the Hashtag filter. */
export async function getHashtagOptions(): Promise<FilterOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("kudos").select("hashtags").eq("is_spam", false);
  const set = new Set<string>();
  (data ?? []).forEach((r) => (r.hashtags ?? []).forEach((h: string) => set.add(h)));
  return [...set].sort().map((h) => ({ value: h, label: h }));
}

/** Distinct departments across profiles, for the Phòng ban filter. */
export async function getDepartmentOptions(): Promise<FilterOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("department")
    .not("department", "is", null);
  const set = new Set<string>();
  (data ?? []).forEach((r) => r.department && set.add(r.department));
  return [...set].sort().map((d) => ({ value: d, label: d }));
}

/** Sidebar stats for the viewer (received/sent/hearts) + placeholder boxes. */
export async function getSidebarStats(viewerProfileId: string): Promise<ProfileStats> {
  const supabase = await createClient();
  const [received, sent, hearts] = await Promise.all([
    supabase.from("kudos").select("*", { count: "exact", head: true }).eq("receiver_id", viewerProfileId),
    supabase.from("kudos").select("*", { count: "exact", head: true }).eq("sender_id", viewerProfileId),
    supabase
      .from("kudos_hearts")
      .select("kudos!inner(receiver_id)", { count: "exact", head: true })
      .eq("kudos.receiver_id", viewerProfileId),
  ]);
  return {
    kudosReceived: received.count ?? 0,
    kudosSent: sent.count ?? 0,
    heartsReceived: hearts.count ?? 0,
    ...PLACEHOLDER_BOX_STATS,
  };
}

/**
 * Sidebar leaderboards — seeded/placeholder (no rank-up/gift event tables yet).
 * Both lists are drawn from the most-recent profiles.
 */
export async function getLeaderboards(): Promise<{
  rankUps: LeaderboardEntry[];
  giftReceivers: LeaderboardEntry[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, hero_badge")
    .order("created_at", { ascending: false })
    .limit(10);
  const rows = data ?? [];
  const base = (r: (typeof rows)[number]) => ({
    id: r.id as string,
    displayName: (r.display_name as string) ?? "Sunner",
    avatarUrl: (r.avatar_url as string) || FALLBACK_AVATAR,
  });
  return {
    giftReceivers: rows.map((r) => ({ ...base(r), note: "Nhận được 1 áo phông SAA" })),
    rankUps: rows.map((r) => ({
      ...base(r),
      note: r.hero_badge ? `Thăng hạng ${String(r.hero_badge)}` : "Vừa thăng hạng",
    })),
  };
}

/** Spotlight board data: total kudos in the system + recipient names (word cloud). */
export async function getSpotlightData(): Promise<{ total: number; names: string[] }> {
  const supabase = await createClient();
  const [totalRes, namesRes] = await Promise.all([
    supabase.from("kudos").select("*", { count: "exact", head: true }).eq("is_spam", false),
    supabase.from("profiles").select("display_name").limit(60),
  ]);
  const names = (namesRes.data ?? [])
    .map((r) => (r.display_name as string) ?? "")
    .filter(Boolean);
  return { total: totalRes.count ?? 0, names };
}

/** All profiles as compose-dialog receiver options / @mention targets (id + name). */
export async function getReceiverOptions(): Promise<MentionableUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .order("display_name", { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id as string,
    displayName: (r.display_name as string) ?? "Sunner",
  }));
}

/**
 * Hashtag suggestions for the compose "+ Hashtag" dropdown: the curated list
 * unioned with hashtags already used on the board, de-duped (case-insensitive).
 */
export async function getHashtagSuggestions(): Promise<string[]> {
  const existing = await getHashtagOptions();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...CURATED_HASHTAGS, ...existing.map((o) => o.value)]) {
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      out.push(tag);
    }
  }
  return out;
}

/** Avatar hover-card data for one profile (name, unit, badge, kudos counts). */
export async function getHoverCard(profileId: string): Promise<HoverCardData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, department, hero_badge")
    .eq("id", profileId)
    .maybeSingle();
  if (!data) return null;

  const [received, sent] = await Promise.all([
    supabase.from("kudos").select("*", { count: "exact", head: true }).eq("receiver_id", profileId),
    supabase.from("kudos").select("*", { count: "exact", head: true }).eq("sender_id", profileId),
  ]);

  return {
    id: data.id,
    displayName: data.display_name ?? "Sunner",
    departmentPath: data.department ?? "",
    heroBadge: data.hero_badge ?? null,
    kudosReceived: received.count ?? 0,
    kudosSent: sent.count ?? 0,
  };
}

// Domain types for the Sun* Kudos live board (/kudos). DB rows are snake_case;
// these camelCase shapes are what the board UI consumes (mapped in queries.ts).

import type { HeroBadge, ProfileStats } from "@/lib/profile/types";

export type { HeroBadge, ProfileStats };

/** Sender/receiver summary shown on a board card / hover. */
export type KudosBoardUser = {
  id: string;
  displayName: string;
  avatarUrl: string;
  /** Short rank/department code, e.g. "CEVC2". */
  rank: string;
  /** Department for the "Phòng ban" filter, e.g. "CEVC2" / "OPD" / "Infra". */
  department: string | null;
  heroBadge: HeroBadge;
};

/** One kudos post on the board, with viewer-relative like state. */
export type BoardKudos = {
  id: string;
  sender: KudosBoardUser;
  receiver: KudosBoardUser;
  message: string;
  images: string[];
  hashtags: string[];
  category: string | null;
  heartCount: number;
  /** Whether the current viewer has hearted this kudos. */
  likedByMe: boolean;
  /** False when the viewer is the sender (cannot like own kudos). */
  canLike: boolean;
  /** True when the viewer authored this kudos (shows the edit pencil). */
  ownedByViewer: boolean;
  /** ISO timestamp; format with formatKudosTime() for "HH:mm - MM/DD/YYYY". */
  createdAt: string;
};

/** A single-select dropdown option (Hashtag / Phòng ban). */
export type FilterOption = { value: string; label: string };

/** A row in a sidebar leaderboard. */
export type LeaderboardEntry = {
  id: string;
  displayName: string;
  avatarUrl: string;
  /** Small descriptive note, e.g. "Nhận được 1 áo phông SAA". */
  note: string;
};

/** Data for the avatar hover popover. */
export type HoverCardData = {
  id: string;
  displayName: string;
  /** Full unit path, e.g. "C&C Executive/C&C Line/HRD Unit/OPD Center". */
  departmentPath: string;
  heroBadge: HeroBadge;
  kudosReceived: number;
  kudosSent: number;
};

/** Selected board filters (drive both Highlight + All Kudos). */
export type BoardFilters = { hashtag?: string; department?: string };

/** Spotlight board data — total kudos count + recipient names (word cloud). */
export type SpotlightData = { total: number; names: string[] };

/** Everything the /kudos page needs in one shot. */
export type BoardData = {
  highlight: BoardKudos[];
  feed: BoardKudos[];
  hashtagOptions: FilterOption[];
  departmentOptions: FilterOption[];
  stats: ProfileStats;
  rankUps: LeaderboardEntry[];
  giftReceivers: LeaderboardEntry[];
  spotlight: SpotlightData;
};

/**
 * Format an ISO timestamp as the design's "HH:mm - MM/DD/YYYY".
 * Shifts to a FIXED +07:00 (Asia/Ho_Chi_Minh) and reads UTC parts, so the
 * server (UTC) and the client (any timezone) produce an identical string —
 * this is required to avoid a React hydration mismatch.
 */
export function formatKudosTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const t = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(t.getUTCHours())}:${p(t.getUTCMinutes())} - ${p(t.getUTCMonth() + 1)}/${p(t.getUTCDate())}/${t.getUTCFullYear()}`;
}

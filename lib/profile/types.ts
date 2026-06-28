// Domain types for the profile page. DB rows are snake_case; these are the
// camelCase shapes the UI consumes (mapped in queries.ts).

// Four hero-badge tiers (by how many distinct people sent you Kudos):
// new_hero (1–4), rising_hero (5–9), super_hero (10–20), legend_hero (>20).
export type HeroBadge =
  | "new_hero"
  | "rising_hero"
  | "super_hero"
  | "legend_hero"
  | null;

export type Profile = {
  id: string;
  displayName: string;
  avatarUrl: string;
  rank: string;
  heroBadge: HeroBadge;
};

/** Sender/receiver summary embedded in a kudos card. */
export type KudosUser = {
  displayName: string;
  avatarUrl: string;
  rank: string;
  heroBadge: HeroBadge;
};

export type KudosWithUsers = {
  id: string;
  sender: KudosUser;
  receiver: KudosUser;
  message: string;
  images: string[];
  hashtags: string[];
  category: string | null;
  isSpam: boolean;
  heartCount: number;
  createdAt: string;
};

export type ProfileStats = {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  /** Secret Box stats are placeholders — no backend feature yet. */
  boxesOpened: number;
  boxesUnopened: number;
};

export type KudosFilter = "received" | "sent";

/** Placeholder Secret Box counts (no backend feature). */
export const PLACEHOLDER_BOX_STATS = { boxesOpened: 25, boxesUnopened: 25 } as const;

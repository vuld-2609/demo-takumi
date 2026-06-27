// Domain types for the profile page. DB rows are snake_case; these are the
// camelCase shapes the UI consumes (mapped in queries.ts).

export type HeroBadge = "legend_hero" | "super_hero" | null;

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

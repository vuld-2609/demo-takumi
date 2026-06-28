/**
 * HeroBadge — game-style tier medal pill.
 * Four tiers: new_hero, rising_hero (green), super_hero (red), legend_hero (gold).
 * Gradient pill + emblem + two-tone label (tier word coloured, "Hero" light/dark).
 * Backward-compatible: existing callers pass only `variant`.
 */

export type HeroBadgeVariant = "new_hero" | "rising_hero" | "super_hero" | "legend_hero";

const TIER_WORD: Record<HeroBadgeVariant, string> = {
  new_hero: "New",
  rising_hero: "Rising",
  super_hero: "Super",
  legend_hero: "Legend",
};

/** Per-tier gradient + border + emblem + label colours (approximates the medals). */
const TIER: Record<
  HeroBadgeVariant,
  { gradient: string; border: string; ring: string; word: string; hero: string }
> = {
  new_hero: {
    gradient: "linear-gradient(180deg,#2A3942 0%,#0E1A20 100%)",
    border: "#7C8B92",
    ring: "#C0CDD3",
    word: "#FFFFFF",
    hero: "#FFFFFF",
  },
  rising_hero: {
    gradient: "linear-gradient(180deg,#0F3D24 0%,#06180E 100%)",
    border: "#3FBF6F",
    ring: "#7CFF9E",
    word: "#6EE7A0",
    hero: "#FFFFFF",
  },
  super_hero: {
    gradient: "linear-gradient(180deg,#4A0D1F 0%,#1A0309 100%)",
    border: "#C2334B",
    ring: "#FF7A7A",
    word: "#FF6B6B",
    hero: "#FFFFFF",
  },
  legend_hero: {
    gradient: "linear-gradient(180deg,#FFD66B 0%,#C98A1E 100%)",
    border: "#FFE9A6",
    ring: "#7A4E00",
    word: "#3A2400",
    hero: "#3A2400",
  },
};

interface HeroBadgeProps {
  variant: HeroBadgeVariant;
  className?: string;
}

export default function HeroBadge({ variant, className }: HeroBadgeProps) {
  const tier = TIER[variant];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-0.5 pl-1 pr-3 text-xs font-extrabold${
        className ? ` ${className}` : ""
      }`}
      style={{
        background: tier.gradient,
        border: `1px solid ${tier.border}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      {/* Medal emblem */}
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full"
        style={{ background: tier.gradient, border: `1px solid ${tier.ring}` }}
        aria-hidden
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 8.8l6.5-.9L12 2z"
            fill={tier.ring}
          />
        </svg>
      </span>
      <span style={{ color: tier.word }}>{TIER_WORD[variant]}</span>
      <span style={{ color: tier.hero }}>Hero</span>
    </span>
  );
}

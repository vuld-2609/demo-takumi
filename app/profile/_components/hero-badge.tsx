/**
 * HeroBadge — pill showing "Legend Hero" or "Super Hero".
 * Dark maroon background with gold text; matches the design-spec badge style.
 */

type HeroBadgeVariant = "legend_hero" | "super_hero";

const LABELS: Record<HeroBadgeVariant, string> = {
  legend_hero: "Legend Hero",
  super_hero: "Super Hero",
};

export default function HeroBadge({ variant }: { variant: HeroBadgeVariant }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-3 py-0.5 text-xs font-bold"
      style={{
        backgroundColor: "#4A0D1F",
        color: "#FFEA9E",
        border: "1px solid #998C5F",
      }}
    >
      {LABELS[variant]}
    </span>
  );
}

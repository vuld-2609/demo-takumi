/**
 * SpotlightBoard — "SPOTLIGHT BOARD" section (B.6 + B.7).
 * Dark network/word-cloud panel: total "{n} KUDOS" centered, a search box,
 * scattered recipient names, a live-activity log, and a pan/zoom expand icon.
 * Static visual (no interactive graph / pan-zoom). Positions are computed
 * deterministically from the index so server and client render identically.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { SpotlightData } from "@/lib/kudos/types";
import { SearchIcon } from "@/app/_components/home/icons";

/** Deterministic scatter for name `i` — no Math.random (hydration-safe). */
function scatter(i: number, count: number) {
  const left = 4 + ((i * 37) % 92);
  const top = 12 + ((i * 53) % 74);
  const size = [11, 13, 15][i % 3];
  const dim = 0.45 + ((i * 17) % 50) / 100; // 0.45–0.95
  // Make a couple of names "featured" (gold) like the design's highlighted node.
  const featured = count > 0 && i % 11 === 3;
  return { left, top, size, dim, featured };
}

export default function SpotlightBoard({ data }: { data: SpotlightData }) {
  const t = useTranslations("kudos");
  // Repeat names to fill the canvas without exceeding a sane node count.
  const nodes = Array.from({ length: Math.min(60, Math.max(data.names.length, 24)) }, (_, i) =>
    data.names.length ? data.names[i % data.names.length] : "Sunner",
  );

  return (
    <section className="flex w-full flex-col gap-8">
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm font-medium text-[#FFEA9E]">{t("awardsCaption")}</p>
        <h2
          className="m-0 text-3xl font-bold uppercase tracking-wide text-[#FFEA9E]"
          style={{ textShadow: "0 0 6px #FAE287" }}
        >
          {t("spotlightTitle")}
        </h2>
      </div>

      {/* Network panel */}
      <div
        className="relative h-[480px] w-full overflow-hidden rounded-3xl"
        style={{ border: "1px solid #1C2A33", backgroundColor: "#02060A" }}
      >
        {/* Feather keyvisual background + dark network gradient overlay */}
        <Image
          src="/homepage/keyvisual-bg.png"
          alt=""
          fill
          sizes="1152px"
          aria-hidden
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, rgba(14,26,34,0.65) 0%, rgba(5,11,15,0.9) 55%, #02060A 100%)",
          }}
        />

        {/* Total count */}
        <p
          className="absolute left-1/2 top-6 z-10 m-0 -translate-x-1/2 text-3xl font-extrabold tracking-wide text-white"
          style={{ textShadow: "0 0 12px rgba(255,255,255,0.25)" }}
        >
          {data.total} KUDOS
        </p>

        {/* Search box */}
        <div
          className="absolute left-6 top-6 z-10 flex h-10 w-56 items-center gap-2 rounded-full px-4 text-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.5)" }}
        >
          <SearchIcon size={16} className="shrink-0" />
          <span className="truncate">{t("spotlightSearch")}</span>
        </div>

        {/* Scattered recipient names (word cloud) */}
        {nodes.map((name, i) => {
          const { left, top, size, dim, featured } = scatter(i, data.total);
          return (
            <span
              key={i}
              className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap font-semibold"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${size}px`,
                color: featured ? "#FF6B6B" : `rgba(255,255,255,${dim})`,
              }}
            >
              {name}
            </span>
          );
        })}

        {/* Live activity log */}
        <div className="absolute bottom-5 left-6 z-10 flex flex-col gap-0.5 text-xs text-white/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <p key={i} className="m-0">
              <span className="text-white/35">08:30PM</span>{" "}
              <span className="font-semibold text-white/70">
                {data.names[i % Math.max(data.names.length, 1)] ?? "Sunner"}
              </span>{" "}
              {t("spotlightActivity")}
            </p>
          ))}
        </div>

        {/* Pan/zoom expand icon */}
        <div
          className="absolute bottom-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/60"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)" }}
          aria-label={t("spotlightPanZoom")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 3H3v6M21 9V3h-6M15 21h6v-6M3 15v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}

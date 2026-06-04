"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

// Fallback if NEXT_PUBLIC_COUNTDOWN_TARGET is unset/invalid (set the real
// event date via the env var). Kept in the future so the demo isn't all-zeros.
const FALLBACK_TARGET = "2026-12-31T18:00:00+07:00";

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
}

/** Remaining whole days/hours/minutes until `targetMs`, clamped to >= 0. */
function getRemaining(targetMs: number, nowMs: number): TimeParts {
  const diff = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
  };
}

/** Pad to two digits; invalid/negative → "00", overflow (>99) → "99"
 *  (the design has only two digit boxes per unit, so days cap at 99). */
function twoDigits(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? Math.min(value, 99) : 0;
  return String(safe).padStart(2, "0");
}

export default function CountdownTimer() {
  const t = useTranslations("countdown");

  const targetMs = (() => {
    const raw = process.env.NEXT_PUBLIC_COUNTDOWN_TARGET || FALLBACK_TARGET;
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? Date.parse(FALLBACK_TARGET) : parsed;
  })();

  // null until mounted to avoid SSR/client hydration mismatch (Date differs).
  const [remaining, setRemaining] = useState<TimeParts | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(targetMs, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const parts = remaining ?? { days: 0, hours: 0, minutes: 0 };

  return (
    <section
      className={`${montserrat.className} flex flex-col items-center`}
      style={{ gap: "24px" }}
    >
      <h1
        style={{
          fontWeight: 700,
          fontSize: "36px",
          lineHeight: "48px",
          color: "#FFFFFF",
          textAlign: "center",
          margin: 0,
        }}
      >
        {t("title")}
      </h1>

      <div className="flex flex-row items-center" style={{ gap: "60px" }}>
        <CountdownUnit value={parts.days} label="DAYS" />
        <CountdownUnit value={parts.hours} label="HOURS" />
        <CountdownUnit value={parts.minutes} label="MINUTES" />
      </div>
    </section>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const formatted = twoDigits(value);
  const [d0, d1] = formatted.split("");
  return (
    <div className="flex flex-col items-start" style={{ gap: "21px" }}>
      <div
        className="flex flex-row items-center"
        style={{ gap: "21px" }}
        role="img"
        aria-label={formatted}
      >
        <DigitBox char={d0} />
        <DigitBox char={d1} />
      </div>
      <span
        style={{
          fontWeight: 700,
          fontSize: "36px",
          lineHeight: "48px",
          color: "#FFFFFF",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function DigitBox({ char }: { char: string }) {
  return (
    <div style={{ position: "relative", width: "77px", height: "123px" }}>
      {/* Frosted glass box (opacity 0.5, blurred) — sibling of the digit */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "12px",
          border: "0.75px solid #FFEA9E",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)",
          opacity: 0.5,
          backdropFilter: "blur(24.96px)",
          WebkitBackdropFilter: "blur(24.96px)",
        }}
      />
      {/* LED digit (full opacity, on top) — decorative; unit row carries the label */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"DSEG7 Classic", monospace',
          fontWeight: 700,
          fontSize: "44px",
          lineHeight: 1,
          color: "#FFFFFF",
        }}
      >
        {char}
      </span>
    </div>
  );
}

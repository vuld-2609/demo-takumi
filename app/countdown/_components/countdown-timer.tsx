"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

// The countdown starts at 99 days and ticks DOWN one minute per interval.
// When it reaches 00d 00h 00m it loops back to 99 days and continues.
// (Temporary behaviour — to count toward a real event date instead, derive the
//  initial minutes from `(targetDate - now) / 60000` and stop the loop reset.)
const MINUTES_PER_DAY = 24 * 60;
const START_DAYS = 99;
const START_MINUTES = START_DAYS * MINUTES_PER_DAY; // 142,560
const TICK_MS = 60_000; // advance one minute per tick

/** Pad to two digits; invalid/negative → "00", overflow (>99) → "99"
 *  (the design has only two digit boxes per unit, so days cap at 99). */
function twoDigits(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? Math.min(value, 99) : 0;
  return String(safe).padStart(2, "0");
}

export default function CountdownTimer() {
  const t = useTranslations("countdown");

  // Whole minutes remaining. Deterministic initial value (no Date) → server and
  // client render the same first frame, so there is no hydration mismatch.
  const [minutesLeft, setMinutesLeft] = useState(START_MINUTES);

  useEffect(() => {
    const id = setInterval(() => {
      // Decrement one minute; once it hits zero, loop back to 99 days.
      setMinutesLeft((prev) => (prev <= 0 ? START_MINUTES : prev - 1));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Derive the display units from the single source of truth (minutesLeft).
  const parts = {
    days: Math.floor(minutesLeft / MINUTES_PER_DAY),
    hours: Math.floor((minutesLeft % MINUTES_PER_DAY) / 60),
    minutes: minutesLeft % 60,
  };

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

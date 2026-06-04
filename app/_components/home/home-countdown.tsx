"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getEventDate, getRemaining, twoDigits, type Remaining } from "@/lib/countdown";

// Target is derived from env (deterministic across server/client). Only `now`
// differs between renders, so we suppress hydration warnings on the digits and
// reconcile on mount.
const TARGET_MS = getEventDate().getTime();
const TICK_MS = 1000;

export default function HomeCountdown() {
  const t = useTranslations("home.hero");

  const [remaining, setRemaining] = useState<Remaining>(() =>
    getRemaining(TARGET_MS, Date.now())
  );

  useEffect(() => {
    const update = () => setRemaining(getRemaining(TARGET_MS, Date.now()));
    update();
    const id = setInterval(update, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-start gap-4">
      {/* "Coming soon" — hidden once the event start time is reached (ID-42). */}
      {!remaining.isPast && (
        <p className="m-0 text-2xl font-bold leading-8 text-white">
          {t("comingSoon")}
        </p>
      )}

      <div className="flex flex-row items-center gap-5 sm:gap-10">
        <CountdownUnit value={remaining.days} label="DAYS" />
        <CountdownUnit value={remaining.hours} label="HOURS" />
        <CountdownUnit value={remaining.minutes} label="MINUTES" />
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const [d0, d1] = twoDigits(value).split("");
  return (
    <div className="flex flex-col justify-center gap-3 sm:gap-3.5">
      <div
        className="flex flex-row items-center gap-2 sm:gap-3.5"
        role="img"
        aria-label={`${twoDigits(value)} ${label.toLowerCase()}`}
      >
        <DigitBox char={d0} />
        <DigitBox char={d1} />
      </div>
      <span className="text-base font-bold uppercase leading-6 text-white sm:text-2xl sm:leading-8">
        {label}
      </span>
    </div>
  );
}

function DigitBox({ char }: { char: string }) {
  return (
    <div className="relative h-16 w-10 sm:h-[81.92px] sm:w-[51.2px]">
      {/* Frosted glass box (opacity 0.5, blurred) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "8px",
          border: "0.5px solid #FFEA9E",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.10) 100%)",
          opacity: 0.5,
          backdropFilter: "blur(16.64px)",
          WebkitBackdropFilter: "blur(16.64px)",
        }}
      />
      {/* LED digit */}
      <span
        suppressHydrationWarning
        className="absolute inset-0 flex items-center justify-center text-[34px] leading-none text-white sm:text-[44px]"
        style={{ fontFamily: '"DSEG7 Classic", monospace', fontWeight: 700 }}
      >
        {char}
      </span>
    </div>
  );
}

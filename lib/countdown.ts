/**
 * Event countdown helpers (shared, framework-agnostic).
 *
 * The event datetime is configured via the `NEXT_PUBLIC_EVENT_DATETIME`
 * environment variable in ISO-8601 format (e.g. "2026-12-26T18:30:00+07:00").
 * If the variable is missing or invalid, we fall back to DEFAULT_EVENT so the
 * page never crashes (spec ID-60).
 */

/** Fallback event datetime used when the env var is absent or unparseable. */
export const DEFAULT_EVENT = "2026-12-26T18:30:00+07:00";

export type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  /** True once the event start time has been reached/passed. */
  isPast: boolean;
};

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Resolve the target event date from env, falling back safely. */
export function getEventDate(): Date {
  const raw = process.env.NEXT_PUBLIC_EVENT_DATETIME ?? DEFAULT_EVENT;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    // Invalid env value → fallback (no crash).
    return new Date(DEFAULT_EVENT);
  }
  return parsed;
}

/** Whole days/hours/minutes remaining until `targetMs`, clamped at zero. */
export function getRemaining(targetMs: number, nowMs: number): Remaining {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / MS_PER_DAY),
    hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
    isPast: false,
  };
}

/** Pad a value to two digits; clamp negatives to 0 and overflow (>99) to 99
 *  (the design only renders two digit boxes per unit). */
export function twoDigits(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? Math.min(value, 99) : 0;
  return String(safe).padStart(2, "0");
}

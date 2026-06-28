import type { SVGProps } from "react";
import type { NotificationType } from "@/lib/notifications/types";

/** Envelope-with-plus — a received kudos (design: blue mail glyph). */
function EnvelopeReceivedIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <rect x="2" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth={1.8} />
      <path d="M2.5 6.5L9 11L15.5 6.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 8V14M16 11H22" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Heart-with-plus — a received heart/tim (design: red heart glyph). */
function HeartReceivedIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M11 20.5C11 20.5 2.5 15.5 2.5 9.5C2.5 7 4.4 5 6.8 5C8.3 5 9.7 5.8 10.5 7C11.3 5.8 12.7 5 14.2 5C16.6 5 18.5 7 18.5 9.5C18.5 10.4 18.3 11.2 18 12"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 13V19M17 16H23" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Mention "@" badge — someone tagged you in a kudos (design: gold accent). */
function MentionIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M16 12V13.5C16 14.88 17.12 16 18.5 16C19.88 16 21 14.88 21 13.5V12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C13.5 21 14.91 20.63 16.15 19.98"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Per-type icon + its accent color, matching the notification design. */
export function NotificationTypeIcon({ type, size = 24 }: { type: NotificationType; size?: number }) {
  if (type === "heart_received") {
    return (
      <span className="text-[#FF6B81]">
        <HeartReceivedIcon size={size} />
      </span>
    );
  }
  if (type === "mention_received") {
    return (
      <span className="text-[#FFEA9E]">
        <MentionIcon size={size} />
      </span>
    );
  }
  return (
    <span className="text-[#4A90E2]">
      <EnvelopeReceivedIcon size={size} />
    </span>
  );
}

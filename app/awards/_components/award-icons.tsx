import type { SVGProps } from "react";

/** Target/crosshair marker shown before award titles and nav items. */
export function TargetIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Diamond marker shown before the award-quantity line. */
export function DiamondIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M5 9h14l-7 11L5 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 9l2.5-4h9L19 9M9 9l3-4 3 4M5 9h14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** License/award marker shown before the prize-value line. */
export function LicenseIcon({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

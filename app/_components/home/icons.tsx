import type { SVGProps } from "react";

/**
 * Up-right arrow (↗) used on CTA / "Chi tiết" buttons. Uses `currentColor`
 * so the parent button controls the colour (dark on gold, gold on outline).
 */
export function ArrowUpRight({ size = 24, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}

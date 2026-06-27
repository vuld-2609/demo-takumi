"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string };

/**
 * Header navigation links with a route-aware active state (spec A1). The active
 * item (matching the current pathname) gets the gold underline + glow; "/" is
 * matched exactly so it isn't active on every sub-route.
 */
export default function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "border-b border-[#FFEA9E] px-4 py-3 text-sm font-bold text-[#FFEA9E]"
                : "rounded px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            }
            style={active ? { textShadow: "0 0 6px #FAE287" } : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

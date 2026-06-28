"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./site-nav";

/**
 * Footer navigation with the same route-aware active state as the header
 * (gold + glow on the current route). "/" matches exactly so it isn't active
 * on every sub-route.
 */
export default function FooterNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`text-sm font-bold transition-colors ${
              active ? "text-[#FFEA9E]" : "text-white hover:text-[#FFEA9E]"
            }`}
            style={active ? { textShadow: "0 0 6px #FAE287" } : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { TargetIcon } from "./award-icons";

export type AwardNavItem = { key: string; label: string };

/**
 * Sticky left-hand category navigation (spec C). Sticks to the viewport while
 * the award cards scroll past ("note highlight đi theo khi scroll"). A scroll
 * spy (IntersectionObserver) marks the in-view section active (gold + underline
 * per spec); clicking an item smooth-scrolls to its section.
 */
export default function AwardNav({ items }: { items: AwardNavItem[] }) {
  const [active, setActive] = useState(items[0]?.key ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(`award-${item.key}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const lastKey = items[items.length - 1]?.key;
    const atPageBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

    const observer = new IntersectionObserver(
      (entries) => {
        // When scrolled to the very bottom, the last section can leave the
        // observation band while still on screen — lock to it so it stays lit.
        if (lastKey && atPageBottom()) {
          setActive(lastKey);
          return;
        }
        // Otherwise pick the entry nearest the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("award-", ""));
      },
      // Bias the active line toward the upper portion of the viewport.
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));

    const onScroll = () => {
      if (lastKey && atPageBottom()) setActive(lastKey);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  const handleClick = (key: string) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`award-${key}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    setActive(key);
  };

  return (
    <nav aria-label="Award categories" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleClick(item.key)}
            aria-current={isActive ? "location" : undefined}
            className={`flex items-center gap-2 border-l-2 px-4 py-2 text-left text-sm font-bold transition-colors ${
              isActive
                ? "border-[#FFEA9E] text-[#FFEA9E]"
                : "border-transparent text-white/70 hover:text-white"
            }`}
            style={isActive ? { textShadow: "0 0 6px #FAE287" } : undefined}
          >
            <TargetIcon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

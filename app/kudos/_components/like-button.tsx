"use client";

/**
 * LikeButton — heart icon + count with optimistic toggle.
 * Gray when not liked → red (#D4271D) when liked.
 * Disabled (dimmed, cursor-not-allowed) when `disabled` prop is true (sender's own kudos).
 * Optimistic: flips state immediately, calls toggleHeart server action, reconciles
 * with returned value; reverts on error.
 */

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/app/_components/home/icons";
import { toggleHeart } from "@/app/actions/kudos";

interface LikeButtonProps {
  kudosId: string;
  count: number;
  liked: boolean;
  /** When true the viewer is the sender — cannot like their own kudos. */
  disabled: boolean;
  /** Visual tone of the surface the button sits on (default light card). */
  tone?: "onLight" | "onDark";
  /** Larger heart + count, matching the Highlight/All-Kudos card footer. */
  size?: "sm" | "lg";
}

export default function LikeButton({
  kudosId,
  count,
  liked,
  disabled,
  tone = "onLight",
  size = "sm",
}: LikeButtonProps) {
  const t = useTranslations("kudos");
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(count);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (disabled || isPending) return;

    /* Optimistic update */
    const nextLiked = !optimisticLiked;
    const nextCount = optimisticCount + (nextLiked ? 1 : -1);
    setOptimisticLiked(nextLiked);
    setOptimisticCount(nextCount);

    startTransition(async () => {
      try {
        const result = await toggleHeart(kudosId);
        /* Reconcile with server truth */
        setOptimisticLiked(result.liked);
        setOptimisticCount(result.heartCount);
      } catch {
        /* Revert on error */
        setOptimisticLiked(optimisticLiked);
        setOptimisticCount(optimisticCount);
      }
    });
  }

  const inactiveColor = tone === "onLight" ? "#1A1A1A" : "rgba(255,255,255,0.6)";
  const inactiveHeart = tone === "onLight" ? "rgba(26,26,26,0.45)" : "rgba(255,255,255,0.6)";
  const heartColor = optimisticLiked ? "#D4271D" : inactiveHeart;
  const heartFill = optimisticLiked ? "#D4271D" : "none";
  const heartSize = size === "lg" ? 24 : 18;
  const textClass = size === "lg" ? "text-xl font-bold" : "text-sm font-medium";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      aria-label={`${optimisticCount} ${t("hearts")}${optimisticLiked ? " — liked" : ""}`}
      aria-pressed={optimisticLiked}
      className={`flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4271D] disabled:cursor-not-allowed disabled:opacity-40 ${textClass}`}
      style={{ color: optimisticLiked ? "#D4271D" : inactiveColor }}
    >
      <HeartIcon
        size={heartSize}
        style={{ color: heartColor, fill: heartFill }}
        className="transition-colors"
      />
      <span>{optimisticCount.toLocaleString("vi-VN")}</span>
    </button>
  );
}

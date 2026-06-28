/**
 * KudosPostCard — light All-Kudos post card (C.3).
 * Design: 680px wide, bg #FFF8E1, radius 24, padding 40/40/16, gap 16.
 * sender → arrow → receiver, divider, timestamp (+ edit pencil if own kudos),
 * centered category, nested message box (line-clamp-5), image gallery (max 5),
 * hashtags red, footer like + copy-link.
 * Server component — interactive children carry their own "use client".
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { BoardKudos, HoverCardData } from "@/lib/kudos/types";
import { formatKudosTime } from "@/lib/kudos/types";
import { PlayIcon, PenIcon } from "@/app/_components/home/icons";
import HeroBadge from "@/app/profile/_components/hero-badge";
import HeroBadgeTooltip from "./hero-badge-tooltip";
import AvatarHoverCard from "./avatar-hover-card";
import LikeButton from "./like-button";
import CopyLinkButton from "./copy-link-button";

interface KudosPostCardProps {
  kudos: BoardKudos;
  onSendKudo: (receiverId: string) => void;
}

function toHoverData(user: BoardKudos["sender"]): HoverCardData {
  return {
    id: user.id,
    displayName: user.displayName,
    departmentPath: user.department ?? user.rank,
    heroBadge: user.heroBadge,
    kudosReceived: 0,
    kudosSent: 0,
  };
}

function CardUser({
  user,
  onSendKudo,
}: {
  user: BoardKudos["sender"];
  onSendKudo: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <AvatarHoverCard data={toHoverData(user)} onSendKudo={onSendKudo}>
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
          style={{ border: "2px solid #998C5F" }}
        >
          <Image src={user.avatarUrl} alt={user.displayName} fill sizes="64px" className="object-cover" />
        </div>
      </AvatarHoverCard>
      <span className="max-w-[160px] truncate text-sm font-bold leading-tight text-[#1A1A1A]">
        {user.displayName}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[#1A1A1A]/55">{user.rank}</span>
        {user.heroBadge && (
          <HeroBadgeTooltip variant={user.heroBadge}>
            <HeroBadge variant={user.heroBadge} />
          </HeroBadgeTooltip>
        )}
      </div>
    </div>
  );
}

export default function KudosPostCard({ kudos, onSendKudo }: KudosPostCardProps) {
  const t = useTranslations("kudos");
  const categoryLabel =
    kudos.category === "idol_gioi_tre" ? t("categoryIdolGioiTre") : kudos.category;
  return (
    <article
      className="flex w-full flex-col gap-4"
      style={{ backgroundColor: "#FFF8E1", borderRadius: "24px", padding: "40px 40px 16px" }}
    >
      {/* Sender → arrow → receiver */}
      <div className="flex items-start justify-between gap-4">
        <CardUser user={kudos.sender} onSendKudo={onSendKudo} />
        <div className="mt-6 shrink-0 text-[#998C5F]">
          <PlayIcon size={20} />
        </div>
        <CardUser user={kudos.receiver} onSendKudo={onSendKudo} />
      </div>

      <hr className="m-0 border-0 border-t border-[#E5D9B6]" />

      {/* Timestamp + edit (own kudos) */}
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs text-[#998C5F]">{formatKudosTime(kudos.createdAt)}</p>
        {kudos.ownedByViewer && (
          <button type="button" aria-label="Edit" className="text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
            <PenIcon size={18} />
          </button>
        )}
      </div>

      {/* Category */}
      {categoryLabel && (
        <p className="m-0 text-center text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
          {categoryLabel}
        </p>
      )}

      {/* Message — nested box */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ backgroundColor: "#FFFDF5", border: "1px solid #EFE3BE" }}
      >
        <p className="m-0 line-clamp-5 text-sm font-semibold leading-6 text-[#1A1A1A]">
          {kudos.message}
        </p>
      </div>

      {/* Image gallery — max 5 × 88px thumbnails */}
      {kudos.images.length > 0 && (
        <div className="flex gap-2 overflow-hidden">
          {kudos.images.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg"
            >
              <Image src={src} alt={`Ảnh ${i + 1}`} fill sizes="88px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Hashtags */}
      {kudos.hashtags.length > 0 && (
        <p className="m-0 text-sm font-medium" style={{ color: "#DC2626" }}>
          {kudos.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: "#E5D9B6" }}
      >
        <LikeButton
          kudosId={kudos.id}
          count={kudos.heartCount}
          liked={kudos.likedByMe}
          disabled={!kudos.canLike}
          tone="onLight"
          size="lg"
        />
        <CopyLinkButton kudosId={kudos.id} colorClass="text-[#1A1A1A]/70" />
      </div>
    </article>
  );
}

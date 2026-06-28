/**
 * HighlightCard — the square Kudos card used in the Highlight carousel (B.3).
 * Design: 528×525 light card (#FFF8E1), 4px gold border (#FFEA9E), radius 16,
 * padding 24/24/16, gap 16. Same light look as the All-Kudos post card.
 * Layout: sender → arrow → receiver, divider, timestamp (+ edit if own),
 * centered category, nested message box (line-clamp-3), hashtags, footer.
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

interface HighlightCardProps {
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
      <span className="max-w-[150px] truncate text-sm font-bold leading-tight text-[#1A1A1A]">
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

export default function HighlightCard({ kudos, onSendKudo }: HighlightCardProps) {
  const t = useTranslations("kudos");
  const categoryLabel =
    kudos.category === "idol_gioi_tre" ? t("categoryIdolGioiTre") : kudos.category;
  return (
    <article
      className="flex h-full w-full flex-col gap-3 overflow-hidden"
      style={{
        backgroundColor: "#FFF8E1",
        border: "4px solid #FFEA9E",
        borderRadius: "16px",
        padding: "24px 24px 16px",
      }}
    >
      {/* Header: sender → arrow → receiver */}
      <div className="flex items-start justify-between gap-2">
        <CardUser user={kudos.sender} onSendKudo={onSendKudo} />
        <div className="mt-6 shrink-0 text-[#998C5F]">
          <PlayIcon size={18} />
        </div>
        <CardUser user={kudos.receiver} onSendKudo={onSendKudo} />
      </div>

      <hr className="m-0 border-0 border-t border-[#E5D9B6]" />

      {/* Timestamp + edit (own kudos) */}
      <div className="flex items-center justify-between">
        <p className="m-0 text-xs text-[#998C5F]">{formatKudosTime(kudos.createdAt)}</p>
        {kudos.ownedByViewer && (
          <button type="button" aria-label="Edit" className="text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
            <PenIcon size={16} />
          </button>
        )}
      </div>

      {/* Category */}
      {categoryLabel && (
        <p className="m-0 text-center text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
          {categoryLabel}
        </p>
      )}

      {/* Message — nested box, content height (~3 lines) */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ backgroundColor: "#FFFDF5", border: "1px solid #EFE3BE" }}
      >
        <p className="m-0 line-clamp-3 text-sm font-semibold leading-6 text-[#1A1A1A]">
          {kudos.message}
        </p>
      </div>

      {/* Hashtags */}
      {kudos.hashtags.length > 0 && (
        <p className="m-0 truncate text-sm font-medium" style={{ color: "#DC2626" }}>
          {kudos.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
        </p>
      )}

      {/* Footer (mt-auto pins it to the bottom of the square) */}
      <div
        className="mt-auto flex items-center justify-between gap-3 border-t pt-3"
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
        <div className="flex items-center gap-4">
          <CopyLinkButton kudosId={kudos.id} colorClass="text-[#1A1A1A]/70" />
          <button
            type="button"
            className="text-sm font-medium text-[#1A1A1A]/70 transition-opacity hover:opacity-80"
          >
            Xem chi tiết ↗
          </button>
        </div>
      </div>
    </article>
  );
}

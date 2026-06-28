"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { KudosUser, KudosWithUsers } from "@/lib/profile/types";
import HeroBadge from "./hero-badge";
import { HeartIcon, CopyLinkIcon, PlayIcon } from "@/app/_components/home/icons";
import { sanitizeKudoHtml } from "@/lib/kudos/sanitize-html";

/** Format number with dot thousands separator (Vietnamese style): 1000 → "1.000" */
function formatCount(n: number): string {
  return n.toLocaleString("vi-VN");
}

/** Avatar + name + rank + badge — used for both sender and receiver */
function UserInfo({ user }: { user: KudosUser }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full"
        style={{ border: "2px solid #998C5F" }}
      >
        <Image
          src={user.avatarUrl}
          alt={user.displayName}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <span className="max-w-[120px] text-sm font-bold leading-tight text-[#FFEA9E]">
        {user.displayName}
      </span>
      <span className="text-xs text-white/60">{user.rank}</span>
      {user.heroBadge && <HeroBadge variant={user.heroBadge} />}
    </div>
  );
}

/**
 * KudosCard — one kudos post matching the design mms_D_Post card spec.
 * Variants: spam (red "Spam" tag top-right) or category (gold centered label).
 * Card bg #FFF8E1, radius 24px, padding 40px 40px 16px 40px, gap 16px.
 */
/** Map a stored category code to a localized label (falls back to the raw code). */
function useCategoryLabel(category: string | null): string | null {
  const t = useTranslations("profile");
  if (!category) return null;
  if (category === "idol_gioi_tre") return t("categoryIdolGioiTre");
  return category;
}

export default function KudosCard({ kudos }: { kudos: KudosWithUsers }) {
  const t = useTranslations("profile");
  const categoryLabel = useCategoryLabel(kudos.category);
  return (
    <article
      className="relative flex w-full flex-col"
      style={{
        backgroundColor: "#FFF8E1",
        borderRadius: "24px",
        padding: "40px 40px 16px 40px",
        gap: "16px",
      }}
    >
      {/* Spam tag — top-right corner */}
      {kudos.isSpam && (
        <span
          className="absolute right-6 top-6 rounded px-3 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: "#D4271D" }}
        >
          {t("spam")}
        </span>
      )}

      {/* Header: sender → arrow → receiver */}
      <div className="flex items-start justify-between gap-4">
        <UserInfo user={kudos.sender} />
        <div className="mt-6 flex shrink-0 items-center justify-center text-[#998C5F]">
          <PlayIcon size={20} />
        </div>
        <UserInfo user={kudos.receiver} />
      </div>

      {/* Category label — centered gold, shown when not spam */}
      {!kudos.isSpam && categoryLabel && (
        <p
          className="m-0 text-center text-sm font-bold"
          style={{ color: "#FFEA9E" }}
        >
          {categoryLabel}
        </p>
      )}

      {/* Timestamp */}
      <p className="m-0 text-xs text-[#998C5F]">{kudos.createdAt}</p>

      {/* Title (Danh hiệu) */}
      {kudos.title && (
        <p className="m-0 text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
          {kudos.title}
        </p>
      )}

      {/* Message — sanitized rich-text (bold/italic/lists/link/quote/@mention) */}
      <div
        className="kudo-rich m-0 line-clamp-4 text-sm leading-6 text-[#1A1A1A]"
        dangerouslySetInnerHTML={{ __html: sanitizeKudoHtml(kudos.message) }}
      />

      {/* Image grid — up to 5 thumbnails, 88px square */}
      {kudos.images.length > 0 && (
        <div className="flex gap-2 overflow-hidden">
          {kudos.images.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg"
            >
              <Image
                src={src}
                alt={`Ảnh ${i + 1}`}
                fill
                sizes="88px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Hashtags */}
      {kudos.hashtags.length > 0 && (
        <p className="m-0 text-sm font-medium" style={{ color: "#DC2626" }}>
          {kudos.hashtags.join(" ")}
        </p>
      )}

      {/* Footer: hearts (left) + copy-link (right) */}
      <div
        className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: "#E5D9B6" }}
      >
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] transition-opacity hover:opacity-70"
          aria-label={`${formatCount(kudos.heartCount)} ${t("hearts")}`}
        >
          <HeartIcon size={18} className="text-[#D4271D]" />
          <span>{formatCount(kudos.heartCount)}</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] transition-opacity hover:opacity-70"
          aria-label={t("copyLink")}
        >
          <CopyLinkIcon size={18} />
          <span>{t("copyLink")}</span>
        </button>
      </div>
    </article>
  );
}

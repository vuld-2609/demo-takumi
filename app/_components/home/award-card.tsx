import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./icons";

export type Award = {
  /** Hash slug appended to /awards for auto-scroll (ID-47/52). */
  slug: string;
  /** Brand title (not localized). */
  title: string;
  /** Stylized name image shown inside the glowing orb. */
  nameImage: string;
  nameWidth: number;
  /** Short description (already localized). */
  description: string;
  detailLabel: string;
};

/**
 * Single award category card (spec C2.x): glowing orb (shared background +
 * per-award name image), title, 2-line description, and a "Chi tiết" link.
 * The whole card navigates to the Awards Information page anchored at its slug.
 */
export default function AwardCard({ award }: { award: Award }) {
  return (
    <Link
      href={`/awards#${award.slug}`}
      className="group flex w-full max-w-[336px] flex-col gap-6 transition-transform duration-200 hover:-translate-y-1"
    >
      {/* Picture-Award orb */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl border-[0.955px] border-[#FFEA9E] transition-shadow duration-200"
        style={{ boxShadow: "0 4px 4px rgba(0,0,0,0.25), 0 0 6px #FAE287" }}
      >
        <Image
          src="/homepage/award-bg.png"
          alt=""
          fill
          sizes="336px"
          className="object-cover"
          style={{ mixBlendMode: "screen" }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <Image
            src={award.nameImage}
            alt={award.title}
            width={award.nameWidth}
            height={36}
            className="h-auto w-auto max-w-[66%]"
          />
        </div>
      </div>

      {/* Title + description + detail link */}
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-2xl font-normal leading-8 text-[#FFEA9E]">
          {award.title}
        </h3>
        <p className="m-0 line-clamp-2 min-h-12 text-base leading-6 tracking-[0.5px] text-white">
          {award.description}
        </p>
        <span className="inline-flex items-center gap-1 py-4 text-base font-medium leading-6 text-white">
          {award.detailLabel}
          <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

import Image from "next/image";
import { TargetIcon, DiamondIcon, LicenseIcon } from "./award-icons";

export type AwardPrizeView = { value: string; note: string };

/**
 * Presentational award card (spec D.1–D.6). Receives already-resolved strings
 * so it stays a dumb server component. The award visual and the content block
 * swap sides on alternating rows (`imageOnLeft`) to match the design.
 */
export default function AwardCard({
  id,
  image,
  title,
  description,
  quantityLabel,
  quantity,
  unit,
  prizeLabel,
  prizes,
  orLabel,
  imageOnLeft,
}: {
  id: string;
  image: string;
  title: string;
  description: string;
  quantityLabel: string;
  quantity: string;
  unit: string;
  prizeLabel: string;
  prizes: AwardPrizeView[];
  orLabel: string;
  imageOnLeft: boolean;
}) {
  const visual = (
    <Image
      src={`/awards/${image}.png`}
      alt={title}
      width={336}
      height={336}
      sizes="336px"
      className="h-auto w-[280px] lg:w-[336px]"
    />
  );

  const headingId = `${id}-title`;
  const content = (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-2">
        <TargetIcon />
        <h3 id={headingId} className="m-0 text-2xl font-bold text-[#FFEA9E]">{title}</h3>
      </div>
      <p className="m-0 text-justify text-sm font-semibold leading-6 text-white/85">
        {description}
      </p>

      {/* Quantity */}
      <div className="flex flex-wrap items-baseline gap-2 border-t border-white/10 pt-5">
        <DiamondIcon />
        <span className="text-sm font-semibold text-white/70">{quantityLabel}</span>
        <span className="text-xl font-bold text-[#FFEA9E]">{quantity}</span>
        <span className="text-sm text-white/70">{unit}</span>
      </div>

      {/* Prize value(s) */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
        {prizes.map((prize, i) => (
          <div key={prize.value}>
            {i > 0 && (
              <p className="m-0 mb-2 text-sm font-semibold uppercase text-white/50">{orLabel}</p>
            )}
            <div className="flex items-center gap-2">
              <LicenseIcon />
              <span className="text-sm font-semibold text-white/70">{prizeLabel}</span>
            </div>
            <p className="m-0 mt-1 text-2xl font-bold text-[#FFEA9E]">{prize.value}</p>
            {prize.note && <p className="m-0 text-sm text-white/60">{prize.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-28 flex flex-col items-center gap-8 lg:flex-row lg:gap-12"
    >
      {/* DOM order keeps the visual first on mobile (consistent stacking);
          lg:order swaps sides per row to match the alternating design. */}
      <div className={`flex shrink-0 justify-center ${imageOnLeft ? "lg:order-1" : "lg:order-2"}`}>
        {visual}
      </div>
      <div className={`flex-1 ${imageOnLeft ? "lg:order-2" : "lg:order-1"}`}>{content}</div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/app/_components/home/icons";

/**
 * Sun* Kudos promo banner (spec D1/D2) shown at the bottom of the award page.
 * Dark rounded panel with campaign copy + "Chi tiết" CTA on the left and the
 * KUDOS wordmark on the right. CTA navigates to the Sun* Kudos page.
 */
export default function AwardKudosBanner({
  badge,
  label,
  title,
  body,
  detail,
}: {
  badge: string;
  label: string;
  title: string;
  body: string;
  detail: string;
}) {
  return (
    <section className="w-full max-w-[1120px]">
      <div className="relative flex min-h-[420px] w-full items-center overflow-hidden rounded-2xl bg-[#0F0F0F] px-6 py-12 sm:px-16">
        <Image
          src="/awards/kudos-background.png"
          alt=""
          fill
          aria-hidden
          sizes="1120px"
          className="object-cover"
        />

        <div className="relative z-10 flex w-full flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          {/* Left: copy + CTA */}
          <div className="flex max-w-[560px] flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm font-semibold text-[#FFEA9E]">{label}</p>
              <h2 className="m-0 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
              <div className="flex flex-col gap-1 text-sm leading-6 text-white/80">
                <p className="m-0 font-bold text-[#FFEA9E]">{badge}</p>
                <p className="m-0">{body}</p>
              </div>
            </div>
            <Link
              href="/kudos"
              className="group inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 font-bold text-[#00101A] transition-colors hover:bg-[#FFE07A]"
            >
              {detail}
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Right: KUDOS wordmark */}
          <Image
            src="/awards/kudos-logo.svg"
            alt="Sun* Kudos"
            width={383}
            height={72}
            className="h-auto w-[220px] self-end sm:w-[320px] lg:self-center"
          />
        </div>
      </div>
    </section>
  );
}

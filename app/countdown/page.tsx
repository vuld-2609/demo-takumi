import Image from "next/image";
import CountdownTimer from "./_components/countdown-timer";

/**
 * Countdown / Prelaunch page (public route — see proxy PUBLIC_PATHS).
 * Full-screen decorative background + dark cover gradient + countdown timer.
 */
export default function CountdownPage() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Decorative background artwork (full-bleed) */}
      <Image
        src="/countdown/bg-prelaunch.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />

      {/* Cover gradient — darkens for text contrast (exact from design) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0.00) 63.41%)",
        }}
      />

      {/* Centered content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <CountdownTimer />
      </main>
    </div>
  );
}

import Image from "next/image";
import { Montserrat } from "next/font/google";
import SiteHeader from "./_components/home/site-header";
import HeroSection from "./_components/home/hero-section";
import RootFurtherContent from "./_components/home/root-further-content";
import AwardsSection from "./_components/home/awards-section";
import SunKudosSection from "./_components/home/sun-kudos-section";
import WidgetButton from "./_components/home/widget-button";
import SiteFooter from "./_components/home/site-footer";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getViewerProfileId, getReceiverOptions, getHashtagSuggestions } from "@/lib/kudos/queries";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Homepage SAA (authenticated only — gated by proxy/middleware; unauthenticated
 * visitors are redirected to /login). Keyvisual hero backdrop + fixed header,
 * stacked content sections, floating widget, and footer.
 */
export default async function Home() {
  // Compose-modal data for the floating widget (self excluded from recipients).
  const user = await getCurrentUser();
  const viewerId = user ? await getViewerProfileId(user.id) : null;
  const [receivers, hashtagSuggestions] = await Promise.all([
    getReceiverOptions(viewerId),
    getHashtagSuggestions(),
  ]);

  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen flex-col overflow-x-clip`}
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Keyvisual hero backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0">
        <div className="relative w-full">
          <Image
            src="/homepage/keyvisual-bg.png"
            alt=""
            width={1512}
            height={1392}
            priority
            sizes="100vw"
            className="h-auto w-full"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, #00101A 22%, rgba(0,16,26,0.35) 56%, rgba(0,16,26,0) 80%), linear-gradient(to bottom, rgba(0,16,26,0) 55%, #00101A 100%)",
            }}
          />
        </div>
      </div>

      <SiteHeader />

      <main className="relative z-10 flex flex-col items-center gap-24 px-6 pb-24 pt-28 sm:px-12 sm:gap-32 lg:px-36">
        <HeroSection />
        <RootFurtherContent />
        <AwardsSection />
        <SunKudosSection />
      </main>

      <WidgetButton receivers={receivers} hashtagSuggestions={hashtagSuggestions} />

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

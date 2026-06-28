import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Montserrat } from "next/font/google";
import SiteHeader from "@/app/_components/home/site-header";
import SiteFooter from "@/app/_components/home/site-footer";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getViewerProfileId,
  getFilteredKudos,
  pickHighlight,
  sortFeed,
  getHashtagOptions,
  getDepartmentOptions,
  getSidebarStats,
  getLeaderboards,
  getReceiverOptions,
  getHashtagSuggestions,
  getSpotlightData,
} from "@/lib/kudos/queries";
import { PLACEHOLDER_BOX_STATS, type ProfileStats } from "@/lib/profile/types";
import type { BoardData } from "@/lib/kudos/types";
import KudosBoard from "./_components/kudos-board";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const EMPTY_STATS: ProfileStats = {
  kudosReceived: 0,
  kudosSent: 0,
  heartsReceived: 0,
  ...PLACEHOLDER_BOX_STATS,
};

/**
 * Sun* Kudos Live Board (/kudos) — async server component.
 * Requires auth (redirects to /login). Reads real data from Supabase, filtered
 * by ?hashtag / ?department search params (both Highlight + All Kudos). Renders
 * gracefully with empty/zero states when the schema/seed isn't applied yet.
 */
export default async function KudosPage({
  searchParams,
}: {
  searchParams: Promise<{ hashtag?: string; department?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const filters = { hashtag: sp.hashtag, department: sp.department };

  const viewerId = await getViewerProfileId(user.id);

  const [all, hashtagOptions, departmentOptions, leaderboards, receivers, hashtagSuggestions, stats, spotlight] =
    await Promise.all([
      getFilteredKudos(viewerId, filters),
      getHashtagOptions(),
      getDepartmentOptions(),
      getLeaderboards(),
      getReceiverOptions(),
      getHashtagSuggestions(),
      viewerId ? getSidebarStats(viewerId) : Promise.resolve(EMPTY_STATS),
      getSpotlightData(),
    ]);

  const data: BoardData = {
    highlight: pickHighlight(all),
    feed: sortFeed(all),
    hashtagOptions,
    departmentOptions,
    stats,
    rankUps: leaderboards.rankUps,
    giftReceivers: leaderboards.giftReceivers,
    spotlight,
  };

  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen flex-col`}
      style={{ backgroundColor: "#00101A" }}
    >
      <SiteHeader />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Suspense boundary required for useSearchParams() in HighlightSection. */}
        <Suspense fallback={null}>
          <KudosBoard data={data} receivers={receivers} hashtagSuggestions={hashtagSuggestions} />
        </Suspense>
      </div>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

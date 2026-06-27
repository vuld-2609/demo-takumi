import { redirect } from "next/navigation";
import { Montserrat } from "next/font/google";
import SiteHeader from "@/app/_components/home/site-header";
import SiteFooter from "@/app/_components/home/site-footer";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getProfileByAuthUser,
  getProfileStats,
  getKudosFeed,
} from "@/lib/profile/queries";
import { PLACEHOLDER_BOX_STATS, type Profile, type ProfileStats } from "@/lib/profile/types";
import ProfileHero from "./_components/profile-hero";
import ProfileStatsCard from "./_components/profile-stats-card";
import KudosSection from "./_components/kudos-section";

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
 * Profile page — the logged-in user's own profile (/profile).
 * Async server component: requires auth, reads real data from Supabase.
 * Renders gracefully (zeros / empty feed) when the schema/seed isn't applied yet.
 * Layout: keyvisual hero → stats card → kudos section → footer.
 */
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbProfile = await getProfileByAuthUser(user.id);

  // Fallback when no profile row exists yet (trigger not applied / brand-new user).
  const profile: Profile = dbProfile ?? {
    id: "",
    displayName: user.email?.split("@")[0] ?? "Sunner",
    avatarUrl: "/profile/kudos-avatar-1.png",
    rank: "",
    heroBadge: null,
  };

  const [stats, received, sent] = profile.id
    ? await Promise.all([
        getProfileStats(profile.id),
        getKudosFeed(profile.id, "received"),
        getKudosFeed(profile.id, "sent"),
      ])
    : [EMPTY_STATS, [], []];

  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen flex-col`}
      style={{ backgroundColor: "#00101A" }}
    >
      <SiteHeader />

      <main className="relative z-10 flex flex-col items-center gap-12 pb-24 pt-20">
        {/* A — Hero (full-width with keyvisual banner) */}
        <ProfileHero profile={profile} />

        {/* B — Stats card */}
        <div className="w-full px-4">
          <ProfileStatsCard stats={stats} />
        </div>

        {/* C + D — Kudos section heading + card feed */}
        <div className="w-full px-4">
          <KudosSection received={received} sent={sent} />
        </div>
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

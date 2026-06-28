import { redirect } from "next/navigation";
import { Montserrat } from "next/font/google";
import SiteHeader from "@/app/_components/home/site-header";
import SiteFooter from "@/app/_components/home/site-footer";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getViewerProfileId } from "@/lib/kudos/queries";
import { getNotificationFeed } from "@/lib/notifications/queries";
import NotificationsClient from "./notifications-client";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * "Tất cả thông báo" page (/notifications) — async server component.
 * Requires auth (redirects to /login). Pre-fetches the full feed; the client
 * panel then subscribes to Supabase Realtime for live updates.
 */
export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profileId = await getViewerProfileId(user.id);
  const initial = profileId ? await getNotificationFeed(profileId) : { items: [], unread: 0 };

  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen flex-col`}
      style={{ backgroundColor: "#00101A" }}
    >
      <SiteHeader />

      <main className="relative z-10 flex flex-1 flex-col px-4 pb-24 pt-28">
        {profileId ? (
          <NotificationsClient profileId={profileId} initial={initial} />
        ) : null}
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

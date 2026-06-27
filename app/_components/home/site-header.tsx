import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/app/login/_components/language-switcher";
import { getCurrentUser } from "@/lib/auth/current-user";
import HeaderControls from "./header-controls";
import SiteNav from "./site-nav";

/**
 * Main navigation header (spec A1). Public: logo + nav links + language
 * switcher. Authenticated users additionally get the notification bell and
 * account menu (ID-0/ID-1). Fixed to the top of the viewport.
 */
export default async function SiteHeader() {
  const user = await getCurrentUser();
  const t = await getTranslations("home");

  const navLinks = [
    { href: "/", label: t("nav.about") },
    { href: "/awards", label: t("nav.awards") },
    { href: "/kudos", label: t("nav.kudos") },
  ];

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between px-6 sm:px-12 lg:px-36"
      style={{ backgroundColor: "rgba(16,20,23,0.80)" }}
    >
      {/* Left: logo + nav */}
      <div className="flex items-center gap-8 lg:gap-16">
        <Link href="/" aria-label="Sun* Annual Awards home">
          <Image src="/login/saa-logo.png" alt="SAA 2025 Logo" width={52} height={48} priority />
        </Link>
        <SiteNav links={navLinks} />
      </div>

      {/* Right: language + (auth) controls or login link */}
      <div className="flex items-center gap-4">
        {user ? (
          <HeaderControls
            isAdmin={user.isAdmin}
            languageSwitcher={<LanguageSwitcher />}
          />
        ) : (
          <>
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded border border-[#998C5F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              {t("header.login")}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

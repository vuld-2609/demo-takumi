import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import FooterNav from "./footer-nav";

/**
 * Site footer (spec 7): logo + navigation links (left) and copyright (right).
 * Logo and "About SAA 2025" return to the homepage top; other links go to
 * their respective pages.
 */
export default function SiteFooter() {
  const t = useTranslations("home");

  const links = [
    { href: "/", label: t("nav.about") },
    { href: "/awards", label: t("nav.awards") },
    { href: "/kudos", label: t("nav.kudos") },
    { href: "/standards", label: t("nav.standards") },
  ];

  return (
    <footer className="flex w-full flex-col items-center justify-between gap-6 border-t border-[#2E3940] px-6 py-10 sm:flex-row sm:px-[90px]">
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-20">
        <Link href="/" aria-label="Sun* Annual Awards home">
          <Image src="/login/saa-logo.png" alt="SAA 2025 Logo" width={69} height={64} />
        </Link>
        <FooterNav links={links} />
      </div>

      <p className="m-0 text-base font-bold text-white">{t("footer.copyright")}</p>
    </footer>
  );
}

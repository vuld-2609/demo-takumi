"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/actions/auth";
import { UserIcon, GridIcon, ChevronRightIcon } from "./icons";

/**
 * Authenticated header controls (spec A1.6/A1.8): notification bell + panel and
 * the account menu (Profile / Sign out, plus Admin Dashboard for admins). The
 * language switcher is injected so it stays a single shared implementation.
 */
export default function HeaderControls({
  isAdmin,
  languageSwitcher,
}: {
  isAdmin: boolean;
  languageSwitcher: ReactNode;
}) {
  const t = useTranslations("home.header");
  const [openMenu, setOpenMenu] = useState<"none" | "bell" | "account">("none");

  const toggle = (menu: "bell" | "account") =>
    setOpenMenu((cur) => (cur === menu ? "none" : menu));

  return (
    <div
      className="flex items-center gap-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenMenu("none");
      }}
    >
      {/* Click-away overlay */}
      {openMenu !== "none" && (
        <div className="fixed inset-0 z-40" aria-hidden onClick={() => setOpenMenu("none")} />
      )}

      {/* Notification bell */}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => toggle("bell")}
          aria-haspopup="menu"
          aria-expanded={openMenu === "bell"}
          aria-label={t("notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-white/10"
        >
          <Image src="/homepage/icon-notification.svg" alt="" width={24} height={24} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#D4271D]" />
        </button>
        {openMenu === "bell" && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-lg border border-[#998C5F] bg-[#00070C] p-4 text-sm text-white/70"
          >
            {t("noNotifications")}
          </div>
        )}
      </div>

      {/* Language switcher (shared) */}
      {languageSwitcher}

      {/* Account menu */}
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => toggle("account")}
          aria-haspopup="menu"
          aria-expanded={openMenu === "account"}
          aria-label={t("account")}
          className="flex h-10 w-10 items-center justify-center rounded border border-[#998C5F] transition-colors hover:bg-white/10"
        >
          <Image src="/homepage/icon-user-profile.svg" alt="" width={24} height={24} />
        </button>
        {openMenu === "account" && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] flex w-56 flex-col gap-1 overflow-hidden rounded-lg border border-[#998C5F] bg-[#00070C] p-2 text-sm text-white"
          >
            {/* Profile — active item: raised gold-tinted bg + glow */}
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center justify-between rounded-md bg-[#FFEA9E]/10 px-4 py-3 font-semibold text-[#FFEA9E] transition-colors hover:bg-[#FFEA9E]/15"
              style={{ textShadow: "0 0 6px #FAE287" }}
            >
              {t("profile")}
              <UserIcon size={18} />
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                className="flex items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-[#FFEA9E]/10"
              >
                {t("adminDashboard")}
                <GridIcon size={18} />
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center justify-between rounded-md px-4 py-3 text-left transition-colors hover:bg-[#FFEA9E]/10"
              >
                {t("signOut")}
                <ChevronRightIcon size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

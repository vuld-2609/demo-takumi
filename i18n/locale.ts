import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const DEFAULT_LOCALE = "vi";
export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (value === "vi" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}

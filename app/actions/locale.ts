"use server";

import { revalidatePath } from "next/cache";
import { type Locale, setUserLocale } from "@/i18n/locale";

/**
 * Persists the chosen locale to a cookie and invalidates the root layout
 * so the new language takes effect immediately without a full page reload.
 *
 * Example:
 *   import { setLocale } from '@/app/actions/locale';
 *   <button onClick={() => setLocale('en')}>EN</button>
 *   <button onClick={() => setLocale('vi')}>VN</button>
 */
export async function setLocale(locale: Locale): Promise<void> {
  await setUserLocale(locale);
  revalidatePath("/", "layout");
}

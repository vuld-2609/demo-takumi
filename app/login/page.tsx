import { getTranslations } from "next-intl/server";
import LoginHeader from "./_components/login-header";
import LoginHero from "./_components/login-hero";
import LoginFooter from "./_components/login-footer";
import { signInWithGoogle } from "@/app/actions/auth";

/**
 * Login page — server shell composing the header, hero and footer over the
 * dark background + gradient overlays. The Google login button is wired to the
 * `signInWithGoogle` server action (PKCE OAuth redirect → /auth/callback → /).
 * The header language switcher and all visible strings are i18n-driven.
 * A failed sign-in (?error=...) surfaces a translated alert banner.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getTranslations("login");
  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: "#00101A" }}
    >
      {/*
       * Gradient overlay 1 — full-frame, darkens LEFT for text readability.
       * linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)",
        }}
      />

      {/*
       * Gradient overlay 2 — full-frame, darkens BOTTOM.
       * linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)",
        }}
      />

      {/* Fixed header — above gradients */}
      <LoginHeader />

      {/* Main content — flex-1 pushes footer to bottom */}
      <main
        className="relative z-10 flex flex-col flex-1"
        style={{ padding: "96px 144px", paddingTop: "calc(80px + 96px)" }}
      >
        {error && (
          <div
            role="alert"
            className="mb-6 max-w-md rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(220,38,38,0.15)",
              border: "1px solid #DC2626",
              color: "#FCA5A5",
            }}
          >
            {t("loginError")}
          </div>
        )}
        <LoginHero onLogin={signInWithGoogle} />
      </main>

      {/* Footer — above gradients, sticks to bottom */}
      <div className="relative z-10">
        <LoginFooter />
      </div>
    </div>
  );
}

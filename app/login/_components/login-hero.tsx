"use client";

import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export interface LoginHeroProps {
  /** Login handler — typically the `signInWithGoogle` server action. */
  onLogin?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export default function LoginHero({
  onLogin,
  loading = false,
  disabled = false,
}: LoginHeroProps) {
  const t = useTranslations("login");
  const [pending, startTransition] = useTransition();
  const isLoading = loading || pending;
  const isDisabled = disabled || isLoading;

  function handleLogin() {
    if (isDisabled || !onLogin) return;
    startTransition(() => {
      void onLogin();
    });
  }

  return (
    <section
      className="flex flex-col"
      style={{ gap: "120px", paddingLeft: "16px" }}
    >
      {/* Key visual */}
      <Image
        src="/login/root-further.png"
        alt="ROOT FURTHER"
        width={451}
        height={200}
        priority
      />

      {/* Text + CTA group */}
      <div
        className="flex flex-col"
        style={{ gap: "24px", paddingLeft: "16px" }}
      >
        {/* Welcome text — Montserrat 700, 20px/40px, 0.5px letter-spacing */}
        <p
          className={montserrat.className}
          style={{
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "40px",
            letterSpacing: "0.5px",
            color: "#FFFFFF",
            width: "480px",
            textAlign: "left",
            margin: 0,
          }}
        >
          {t("welcomeLine1")}
          <br />
          {t("welcomeLine2")}
        </p>

        {/* Login button — 305×60, bg #FFEA9E, border-radius 8px */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={isDisabled}
          aria-label="Login with Google"
          className={[
            montserrat.className,
            "flex flex-row items-center transition-all",
          ].join(" ")}
          style={{
            width: "305px",
            height: "60px",
            backgroundColor: isDisabled ? "#e8d48a" : "#FFEA9E",
            borderRadius: "8px",
            padding: "16px 24px",
            gap: "8px",
            border: "none",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.7 : 1,
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(255,234,158,0.35)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#fff5c2";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#FFEA9E";
            }
          }}
          onMouseDown={(e) => {
            if (!isDisabled) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#f0d870";
            }
          }}
          onMouseUp={(e) => {
            if (!isDisabled) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#fff5c2";
            }
          }}
        >
          {/* Label — left */}
          <span
            style={{
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: "1",
              color: "#00101A",
              flex: 1,
              textAlign: "left",
              whiteSpace: "nowrap",
            }}
          >
            {t("loginButton")}
          </span>

          {/* Icon — right */}
          {isLoading ? (
            <span
              role="status"
              aria-label="Loading"
              style={{
                display: "inline-block",
                width: "24px",
                height: "24px",
                border: "3px solid #00101A",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }}
            />
          ) : (
            <Image
              src="/login/google-icon.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            />
          )}
        </button>
      </div>
    </section>
  );
}

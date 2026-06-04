import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./language-switcher";

/**
 * Login page header — logo (left) + language switcher (right).
 * The switcher is an interactive client island (open/close + locale change).
 */
export default function LoginHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between"
      style={{
        height: "80px",
        padding: "12px 144px",
        backgroundColor: "rgba(11,15,18,0.80)",
      }}
    >
      {/* Logo — left */}
      <Link href="/" aria-label="Sun* Annual Awards home">
        <Image
          src="/login/saa-logo.png"
          alt="SAA 2025 Logo"
          width={52}
          height={48}
          priority
        />
      </Link>

      {/* Language switcher — right */}
      <LanguageSwitcher />
    </header>
  );
}

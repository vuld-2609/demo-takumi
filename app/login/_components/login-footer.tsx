import { useTranslations } from "next-intl";

export default function LoginFooter() {
  const t = useTranslations("login");

  return (
    <footer
      className="w-full flex justify-center items-center"
      style={{
        padding: "40px 90px",
        borderTop: "1px solid #2E3940",
      }}
    >
      <p
        className="text-sm"
        style={{ color: "rgba(255,255,255,0.60)", margin: 0 }}
      >
        {t("footer")}
      </p>
    </footer>
  );
}

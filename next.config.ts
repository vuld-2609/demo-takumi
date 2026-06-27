import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Google OAuth avatars (profile pictures) are served from
    // lh3–lh6.googleusercontent.com — allow them for next/image.
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);

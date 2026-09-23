import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "1"
    ? {
        output: "export" as const,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
        assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
        trailingSlash: true,
        typescript: { tsconfigPath: "tsconfig.pages.json" },
      }
    : {}),
};

export default nextConfig;

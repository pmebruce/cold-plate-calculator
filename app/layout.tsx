import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "冷板均溫計算器",
  description:
    "依輸出功率、效率、冷卻液流量與矩形流道尺寸，估算冷板平均溫度及出口液溫。",
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "冷板計算",
  },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-64.png`,
    shortcut: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-64.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-180.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07131d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

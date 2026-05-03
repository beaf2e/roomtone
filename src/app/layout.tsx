import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://roomtone.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "roomtone — 매일 한 곡, 한 줄, 하나의 방",
  description: "하루를 노래 한 곡과 문장 하나로 봉인하세요. 복도를 걸으면 매일이 방으로 남습니다.",
  manifest: "/manifest.webmanifest",
  applicationName: "roomtone",
  appleWebApp: {
    capable: true,
    title: "roomtone",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "roomtone",
    title: "roomtone — 매일 한 곡, 한 줄, 하나의 방",
    description: "하루를 노래 한 곡과 문장 하나로 봉인하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "roomtone",
    description: "매일 한 곡, 한 줄, 하나의 방.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

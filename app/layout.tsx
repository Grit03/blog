import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Geist, Sriracha } from "next/font/google";
import { cn } from "@/lib/utils";
import { MainNav } from "@/components/Header/MainNav";
import { themeInitScript } from "@/lib/theme";
import { Analytics } from '@vercel/analytics/next';

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const sriracha = Sriracha({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sriracha",
  display: "swap",
});

const pretendard = localFont({
  src: "../public/font/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "fallback",
});

const tossface = localFont({
  src: "../public/font/TossFaceFontMac.ttf",
  variable: "--font-tossface",
  display: "fallback",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "김규리 | Moving Forward",
    template: "%s | 김규리",
  },
  description:
    "프로젝트, 딥다이브, 학습정리, 회고를 담는 개발 블로그. 프론트엔드와 웹 개발 경험을 기록합니다.",
  keywords: [
    "개발 블로그",
    "프론트엔드",
    "웹 개발",
    "학습 정리",
    "회고",
    "Gyuri",
  ],
  authors: [{ name: "Gyuri", url: siteUrl }],
  creator: "Gyuri",
  publisher: "Gyuri",
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "Gyuri's Devlog",
    title: "김규리 | Moving Forward",
    description:
      "프로젝트, 딥다이브, 학습정리, 회고를 담는 개발 블로그. 프론트엔드와 웹 개발 경험을 기록합니다.",
    images: [
      {
        url: `${siteUrl}/image/blog-og-image.png`,
        width: 1200,
        height: 630,
        alt: "Gyuri's DevLog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "김규리 | Moving Forward",
    description:
      "프로젝트, 딥다이브, 학습정리, 회고를 담는 개발 블로그. 프론트엔드와 웹 개발 경험을 기록합니다.",
    images: [`${siteUrl}/image/blog-og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION && {
        "naver-site-verification":
          process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
      }),
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#16171a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("font-sans", geist.variable)}
      // 아래 인라인 스크립트가 하이드레이션 전에 class/style을 건드린다
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://img.notionusercontent.com" />
        <link rel="dns-prefetch" href="https://www.notion.so" />
        <link
          rel="dns-prefetch"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
        />
      </head>
      <body
        className={cn(pretendard.variable, tossface.variable, "antialiased")}
      >
        <header className="w-full border-b px-3 sm:px-10">
          <div className="mx-auto flex w-full items-center justify-between py-3 lg:max-w-6xl">
            <Link
              href="/"
              className="text-foreground hover:text-primary flex items-center gap-1.5 font-bold transition-colors sm:text-[1.4rem]"
            >
              <span>🍀</span>
              <span className={sriracha.className}>Gyuri&apos;s Devlog</span>
            </Link>
            <MainNav />
          </div>
        </header>
        <main className="flex-1 py-6">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}

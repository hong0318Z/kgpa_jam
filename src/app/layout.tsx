import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getOgSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "한국게임정책학회 - 인터랙티브미디어저널 투고시스템";
const DEFAULT_DESCRIPTION =
  "한국게임정책학회 「인터랙티브미디어저널」 논문 투고 및 심사 관리 시스템";

export async function generateMetadata(): Promise<Metadata> {
  const og = await getOgSettings();
  const title = og.ogTitle || DEFAULT_TITLE;
  const description = og.ogDescription || DEFAULT_DESCRIPTION;
  const siteUrl = process.env.NEXTAUTH_URL ?? "";
  const imageUrl = og.ogImageStoredPath ? `${siteUrl}/api/site/og-image` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Outfit, Montserrat } from "next/font/google";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#007A33",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Akwa Ibom @ 39 Anniversary Trivia & DP Generator",
  description:
    "Celebrate 39 years of the Land of Promise! Test your heritage knowledge with the Akwa Ibom @ 39 Trivia challenge, earn commemorative badges, and generate your customized anniversary celebration display picture. Powered by Sabi AI Technologies Ltd.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Akwa Ibom @ 39",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  keywords: [
    "Akwa Ibom @ 39",
    "Akwa Ibom State Anniversary",
    "Trivia Challenge",
    "DP Generator",
    "Dakkada",
    "Land of Promise",
    "Uyo",
    "Ibom Air",
    "Sabi AI Technologies",
    "Uyouko Nathaniel Ekpo",
  ],
  authors: [{ name: "Sabi AI Technologies Ltd", url: "https://www.sabiaitech.com" }],
  openGraph: {
    title: "Akwa Ibom @ 39 Trivia & Anniversary DP Generator",
    description:
      "Celebrate 39 shades of gratitude! Test your knowledge of Akwa Ibom history, culture, and achievements. Generate your official 39th Anniversary DP.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${montserrat.variable} dark`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#007A33" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased selection:bg-orange-500/30 selection:text-orange-200">
        <NextTopLoader
          color="#FF6600"
          initialPosition={0.12}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease-in-out"
          speed={250}
          shadow="0 0 12px #FF6600,0 0 6px #007A33"
        />
        <Header />

        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-x-hidden">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}

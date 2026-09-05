import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import { AkwaIbomMap } from "@/components/AkwaIbomMap";
import { Footer } from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
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
    <html lang="en" className={`${outfit.variable} dark`}>
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
        <header className="w-full border-b border-orange-500/15 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-1 rounded-xl bg-slate-900 border border-orange-500/30 flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:border-orange-500/60 transition">
                <AkwaIbomMap className="w-8 h-8" size={32} fill="#FF6600" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-white group-hover:text-orange-400 transition">
                  AKWA IBOM @ 39
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider">
                  ARISE &bull; LAND OF PROMISE
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
              <Link
                href="/quiz"
                className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition flex items-center gap-1.5"
              >
                <span>Take Trivia</span>
              </Link>
              <a
                href="https://www.sabiaitech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-[11px]"
              >
                <span>Sabi AI Tech</span>
              </a>
            </nav>
          </div>
        </header>

        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-x-hidden">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}

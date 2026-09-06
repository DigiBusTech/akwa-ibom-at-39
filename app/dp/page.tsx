import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Trophy, ArrowLeft, ShieldCheck } from "lucide-react";
import { StandaloneDPGenerator } from "@/components/StandaloneDPGenerator";

export const metadata: Metadata = {
  title: "Official State Anniversary DP Generator | Akwa Ibom @ 39",
  description:
    "Pre-generate and personalize your official Akwa Ibom @ 39 Statehood Jubilee anniversary DP frame. Lock your photo into the state-approved frame for WhatsApp, Instagram, and Facebook.",
  openGraph: {
    title: "Official State Anniversary DP Generator | Akwa Ibom @ 39",
    description:
      "Personalize and download your official 1080p Akwa Ibom @ 39 commemorative display picture frame.",
    images: ["/frames/official-state-frame.png"],
  },
};

export default function DPPage() {
  return (
    <main className="min-h-screen py-6 sm:py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 sm:pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-orange-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/quiz"
            className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition text-xs font-bold flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Heritage Quiz &amp; Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Hero Title */}
      <div className="text-center space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Statehood Jubilee Frame</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Wear Your <span className="text-orange-500">State Pride</span> on Sept 23rd
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload your portrait, customize your name and LGA, and download the official 1080p celebration frame for WhatsApp Status, Instagram, X, and Facebook.
        </p>
      </div>

      {/* Main Interactive DP Generator */}
      <StandaloneDPGenerator />

      {/* Regulatory & Enterprise Accreditation Footer */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2 text-xs">
        <div className="text-slate-300">
          Powered by{" "}
          <a
            href="https://www.sabiaitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 font-bold underline"
          >
            Sabi AI Technologies Ltd
          </a>
        </div>
        <div className="text-[11px] text-slate-400">
          Founder &amp; Orchestrator:{" "}
          <a
            href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-0.5"
          >
            Uyouko Nathaniel Ekpo
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px]">
          <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            CAC Registered
          </span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            NDPC Compliant
          </span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            NITDA Recognized
          </span>
          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            National Startup Label
          </span>
        </div>
      </div>
    </main>
  );
}

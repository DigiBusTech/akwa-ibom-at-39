"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Trophy, Sparkles, Menu, X, ExternalLink } from "lucide-react";
import { AkwaIbomMap } from "@/components/AkwaIbomMap";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="w-full border-b border-orange-500/15 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="p-1 sm:p-1.5 rounded-xl bg-slate-900 border border-orange-500/30 flex items-center justify-center shrink-0">
            <AkwaIbomMap className="w-6 h-6 sm:w-7 sm:h-7" size={26} fill="#FF6600" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-black text-xs sm:text-sm tracking-tight text-white group-hover:text-orange-400 transition">
              AKWA IBOM @ 39
            </span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold tracking-wider">
              ARISE &bull; LAND OF PROMISE
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2.5 lg:gap-3 text-xs font-semibold">
          <Link
            href="/dp"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>DP Frame</span>
          </Link>

          <Link
            href="/leaderboard"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href="/quiz"
            className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Take Trivia</span>
          </Link>

          <a
            href="https://www.sabiaitech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition text-[11px]"
          >
            <span>Sabi AI Tech</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-orange-500/20 bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-2.5 shadow-2xl">
          <Link
            href="/quiz"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300"
          >
            <span className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Take Trivia Challenge
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40">
              Live
            </span>
          </Link>

          <Link
            href="/dp"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
          >
            <span className="font-semibold text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Personalize DP Frame
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20">
              1080p HD
            </span>
          </Link>

          <Link
            href="/leaderboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200"
          >
            <span className="font-semibold text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              31 LGA Leaderboard
            </span>
          </Link>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Official State Asset</span>
            <a
              href="https://www.sabiaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Sabi AI Tech</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { Shield, Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm">
              39
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Akwa Ibom @ 39 Anniversary</p>
              <p className="text-xs text-emerald-400 font-medium">1987 — 2026 &bull; Land of Promise</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:text-orange-400 transition">
              Home
            </Link>
            <Link href="/quiz" className="hover:text-orange-400 transition">
              Take Trivia
            </Link>
            <Link href="/disclaimer" className="hover:text-orange-400 transition">
              Legal Disclaimer
            </Link>
            <Link href="/privacy-policy" className="hover:text-orange-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-400 transition">
              Terms of Use
            </Link>
          </nav>
        </div>

        {/* Mandatory Independent Tech Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/70 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
          <Shield className="w-5 h-5 text-orange-400 shrink-0 hidden sm:block" />
          <p className="text-xs leading-relaxed text-slate-300">
            Built with 🧡 by Sabi AI Technologies. This platform is an independent tech contribution celebrating Akwa Ibom State. It is not affiliated with, endorsed by, or representing the Akwa Ibom State Government.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>&copy; {new Date().getFullYear()} Sabi AI Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.sabiaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition inline-flex items-center gap-1"
            >
              <span>sabiaitech.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ScrollText, 
  Sparkles, 
  Check, 
  Copy, 
  MessageCircle, 
  ArrowRight,
  Camera,
  Calendar
} from "lucide-react";
import type { DailyLetter } from "@/types/database";

interface DailyLetterProps {
  initialLetter: DailyLetter;
}

export function DailyLetterCard({ initialLetter }: DailyLetterProps) {
  const [copied, setCopied] = useState(false);
  const letter = initialLetter;

  const formattedDate = new Date(letter.publish_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://akwaibom.sabiaitech.com";
  const shareText = `📜 A Letter to Akwa Ibom — Day ${letter.day_number} of 39:\n"${letter.title}"\n\nRead the full letter & generate your official DP: ${shareUrl}`;

  const copyLetterText = () => {
    navigator.clipboard.writeText(`A LETTER TO AKWA IBOM — DAY ${letter.day_number}\n\n${letter.title}\n${formattedDate}\n\n${letter.content}\n\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-slate-950 shadow-2xl p-6 sm:p-8 space-y-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                A Letter to Akwa Ibom
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-bold text-orange-300">
                Day {letter.day_number} of 39
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyLetterText}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Copy Letter"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Share</span>
          </a>
        </div>
      </div>

      {/* Letter Body */}
      <div className="space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {letter.title}
        </h3>
        <p className="text-sm sm:text-base text-slate-300 font-serif leading-relaxed whitespace-pre-line sm:leading-8">
          {letter.content}
        </p>
      </div>

      {/* Signature & Seal */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Official 39th Anniversary Countdown Series</span>
        </div>
        <div className="text-slate-500 italic">
          Celebrating 39 Shades of Gratitude
        </div>
      </div>

      {/* High-Impact CTA to the DP Generator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Generate Your Official Anniversary DP</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-xs text-slate-300">
              Wear your state pride on WhatsApp &amp; social media on September 23rd.
            </p>
          </div>
        </div>

        <Link
          href="/dp"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 touch-manipulation"
        >
          <span>Create DP Frame</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

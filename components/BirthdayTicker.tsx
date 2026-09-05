"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import type { BirthdayWish } from "@/types/database";
import { WishAccordionForm } from "./WishAccordionForm";

interface BirthdayTickerProps {
  initialWishes?: BirthdayWish[];
}

export function BirthdayTicker({ initialWishes = [] }: BirthdayTickerProps) {
  const [wishes, setWishes] = useState<BirthdayWish[]>(initialWishes);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleWishSuccess = (newWish: BirthdayWish, authorName: string) => {
    setWishes((prev) => [newWish, ...prev]);
    setIsAccordionOpen(false);
    setToastMessage(`Thank you, ${authorName}! Your anniversary wish has been broadcast live.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const displayList = wishes.length > 0 ? [...wishes, ...wishes] : [];

  return (
    <div className="w-full relative rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900/80 to-emerald-950/40 border border-orange-500/20 backdrop-blur-md overflow-hidden">
      {/* Ticker Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-orange-500/10 gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Akwa Ibom @ 39 Wishes
          </span>
          <span className="hidden md:inline-block text-xs text-slate-400">• Home & Diaspora</span>
        </div>

        <button
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-500 to-emerald-600 hover:from-orange-600 text-white shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-1.5"
          aria-expanded={isAccordionOpen}
        >
          <span>{isAccordionOpen ? "Close Wish Box" : "Send Birthday Wish"}</span>
          {isAccordionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Accordion Fold-in Wish Form directly below the header */}
      <AnimatePresence>
        {isAccordionOpen && (
          <WishAccordionForm
            onSuccess={handleWishSuccess}
            onCancel={() => setIsAccordionOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marquee Ticker */}
      <div className="relative py-3 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] gap-6 px-4">
          {displayList.map((w, idx) => (
            <div
              key={`${w.id}-${idx}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
            >
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
              <span className="font-semibold text-orange-400">{w.author_name}</span>
              {w.lga && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {w.lga}
                </span>
              )}
              <span className="text-slate-300 italic">&ldquo;{w.wish_text}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

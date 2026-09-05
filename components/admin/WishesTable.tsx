"use client";

import React, { useState, useTransition } from "react";
import { Eye, EyeOff, MessageSquare, Check, Sparkles } from "lucide-react";
import type { BirthdayWish } from "@/types/database";
import { toggleWishApproval } from "@/app/actions/wishes";

interface WishesTableProps {
  initialWishes: BirthdayWish[];
}

export function WishesTable({ initialWishes }: WishesTableProps) {
  const [wishes, setWishes] = useState<BirthdayWish[]>(initialWishes);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (wish: BirthdayWish) => {
    setUpdatingId(wish.id);
    startTransition(async () => {
      try {
        const updatedStatus = await toggleWishApproval(wish.id, wish.is_approved);
        setWishes((prev) =>
          prev.map((w) => (w.id === wish.id ? { ...w, is_approved: updatedStatus } : w))
        );
      } catch (err) {
        console.error("Failed to toggle wish:", err);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Latest 50 Birthday Wishes (Ticker Moderation)
          </h3>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Toggle status to show/hide immediately from live public ticker
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider bg-slate-900/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Location / Chapter</th>
              <th className="py-3 px-4 min-w-[280px]">Wish Message</th>
              <th className="py-3 px-4">Submitted</th>
              <th className="py-3 px-4 text-center">Ticker Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {wishes.map((w) => (
              <tr key={w.id} className="hover:bg-slate-900/40 transition">
                <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                  {w.author_name}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {w.lga || "Proud Akwa Ibomite"}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 italic">
                  &ldquo;{w.wish_text}&rdquo;
                </td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                  {w.created_at ? new Date(w.created_at).toLocaleDateString() : "Live"}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {w.is_approved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      Live on Ticker
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <EyeOff className="w-3 h-3" />
                      Hidden
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleToggle(w)}
                    disabled={updatingId === w.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                      w.is_approved
                        ? "bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700"
                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                    } disabled:opacity-50`}
                  >
                    {w.is_approved ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

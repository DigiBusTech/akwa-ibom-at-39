"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Flame, MapPin, Globe } from "lucide-react";
import { submitBirthdayWish } from "@/app/actions/wishes";
import type { BirthdayWish } from "@/types/database";
import { AKWA_IBOM_LGAS } from "@/types/database";
import { POPULAR_DIASPORA_LOCATIONS } from "@/lib/diaspora";

interface Props {
  onSuccess: (wish: BirthdayWish, authorName: string) => void;
  onCancel: () => void;
}

export function WishAccordionForm({ onSuccess, onCancel }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [locationType, setLocationType] = useState<"lga" | "diaspora">("lga");
  const [selectedLga, setSelectedLga] = useState<string>("Uyo");
  const [diasporaLocation, setDiasporaLocation] = useState("");
  const [wishText, setWishText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const finalLocation = locationType === "lga"
      ? `${selectedLga} LGA`
      : diasporaLocation.trim() ? `${diasporaLocation.trim()} (Diaspora)` : "Global Diaspora";

    if (!authorName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!wishText.trim() || wishText.trim().length < 5) {
      setErrorMsg("Please write at least 5 characters.");
      return;
    }

    startTransition(async () => {
      try {
        await submitBirthdayWish({
          author_name: authorName.trim(),
          lga: finalLocation,
          wish_text: wishText.trim(),
        });
        const optimisticWish: BirthdayWish = {
          id: `temp-${Date.now()}`,
          author_name: authorName.trim(),
          lga: finalLocation,
          wish_text: wishText.trim(),
          is_approved: true,
          created_at: new Date().toISOString(),
        };
        onSuccess(optimisticWish, authorName.trim());
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to publish wish.");
      }
    });
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="overflow-hidden border-b border-orange-500/20 bg-slate-950/95"
    >
      <div className="p-4 sm:p-5 max-w-2xl mx-auto space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Broadcast Your Akwa Ibom @ 39 Wish
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">Live on Ticker</span>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Your Name</label>
              <input
                type="text"
                maxLength={25}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Edidiong Akpan"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Origin / Residence</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLocationType("lga")}
                  className={`py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 ${
                    locationType === "lga" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Home (31 LGAs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("diaspora")}
                  className={`py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 ${
                    locationType === "diaspora" ? "bg-orange-500/20 text-orange-300 border border-orange-500/40" : "text-slate-400"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Diaspora</span>
                </button>
              </div>
            </div>
          </div>

          {locationType === "lga" ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Select Local Government Area</label>
              <select
                value={selectedLga}
                onChange={(e) => setSelectedLga(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                {AKWA_IBOM_LGAS.map((lga) => (
                  <option key={lga} value={lga}>{lga} LGA</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Country / City of Residence</label>
              <input
                type="text"
                list="diaspora-ticker-list"
                maxLength={60}
                value={diasporaLocation}
                onChange={(e) => setDiasporaLocation(e.target.value)}
                placeholder="e.g. Cotonou, Benin Republic or London, UK"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500"
              />
              <datalist id="diaspora-ticker-list">
                {POPULAR_DIASPORA_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase">Anniversary Wish</label>
              <span className="text-[10px] text-slate-500 font-mono">{wishText.length}/160</span>
            </div>
            <textarea
              rows={2}
              maxLength={160}
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="Happy 39th Anniversary to our beloved Land of Promise! May peace and development reign..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm resize-none focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 font-bold text-white text-xs disabled:opacity-50"
            >
              {isPending ? "Broadcasting..." : "Publish Live Wish"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}


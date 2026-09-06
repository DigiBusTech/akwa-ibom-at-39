"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Calendar, Clock, CheckCircle2, AlertTriangle, RotateCcw, Save, PartyPopper } from "lucide-react";
import type { PlatformSettings } from "@/types/database";
import { updateCelebrationSettings } from "@/app/actions/settings";

interface CelebrationSettingsManagerProps {
  initialSettings?: PlatformSettings | null;
}

function toLocalDatetimeInput(isoStr: string | null): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function CelebrationSettingsManager({ initialSettings }: CelebrationSettingsManagerProps) {
  const [startTime, setStartTime] = useState<string>(toLocalDatetimeInput(initialSettings?.confetti_start_time || null));
  const [endTime, setEndTime] = useState<string>(toLocalDatetimeInput(initialSettings?.confetti_end_time || null));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const now = Date.now();
  const startMs = startTime ? new Date(startTime).getTime() : null;
  const endMs = endTime ? new Date(endTime).getTime() : null;
  const isCurrentlyActive = startMs !== null && endMs !== null && now >= startMs && now <= endMs;
  const isScheduledFuture = startMs !== null && startMs > now;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await updateCelebrationSettings({
        confetti_start_time: startTime ? new Date(startTime).toISOString() : null,
        confetti_end_time: endTime ? new Date(endTime).toISOString() : null,
      });
      if (res.success) {
        setFeedback({ type: "success", message: "Celebration settings saved successfully!" });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update settings." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };
  const handleTestEffect = () => {
    if (isTesting) return;
    setIsTesting(true);

    const audio = new Audio("/sounds/fireworks.mp3");
    audio.volume = 0.7;
    try {
      audio.play().catch(() => {});
    } catch {}

    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const colors = ["#FF6600", "#007A33", "#F59E0B", "#10B981", "#FFFFFF"];

    confetti({ particleCount: 70, spread: 360, origin: { x: 0.5, y: 0.6 }, colors });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      confetti({ particleCount: 35, spread: 360, origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() - 0.2 }, colors });
      confetti({ particleCount: 35, spread: 360, origin: { x: Math.random() * 0.3 + 0.6, y: Math.random() - 0.2 }, colors });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      try {
        audio.pause();
        audio.currentTime = 0;
        confetti.reset();
      } catch {}
      setIsTesting(false);
    }, 4000);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebration &amp; Fireworks Scheduler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Celebration Settings</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Schedule automatic fireworks sound effects and state-colored confetti explosions for visitors on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentlyActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Celebration Active Now</span>
            </div>
          ) : isScheduledFuture ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Scheduled for Future</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
              <span>Inactive / Not Scheduled</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${feedback.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border border-rose-500/30 text-rose-300"}`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Preset Shortcuts */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Quick Automation Presets</label>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const start = new Date();
              const end = new Date(Date.now() + 60 * 60 * 1000);
              setStartTime(toLocalDatetimeInput(start.toISOString()));
              setEndTime(toLocalDatetimeInput(end.toISOString()));
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Start Now (Next 1 Hour)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStartTime("2026-09-23T00:00");
              setEndTime("2026-09-23T23:59");
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sept 23 Anniversary Day</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStartTime("");
              setEndTime("");
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Dates</span>
          </button>

          <button
            type="button"
            onClick={handleTestEffect}
            disabled={isTesting}
            className="ml-auto px-3.5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <PartyPopper className={`w-3.5 h-3.5 ${isTesting ? "animate-bounce" : ""}`} />
            <span>{isTesting ? "Testing Effect (4s)..." : "Test Live Effect"}</span>
          </button>
        </div>
      </div>

      {/* Date & Time Picker Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Confetti Start Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-orange-500 transition text-sm [color-scheme:dark]"
            />
            <p className="text-[11px] text-slate-500">When the celebration overlay starts triggering for homepage visitors.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confetti End Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 transition text-sm [color-scheme:dark]"
            />
            <p className="text-[11px] text-slate-500">When the scheduled confetti &amp; fireworks effect will expire.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 hover:from-orange-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-60"
          >
            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

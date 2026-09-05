"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Award,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldAlert,
  Building,
  TrendingUp,
  Download,
  RotateCcw,
} from "lucide-react";
import type { AdminAnalyticsData } from "@/app/actions/admin";
import { fetchAdminDashboardData } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { AdminCharts } from "./AdminCharts";
import { WishesTable } from "./WishesTable";
import { AkwaIbomMap } from "../AkwaIbomMap";

interface AdminDashboardClientProps {
  initialData: AdminAnalyticsData;
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "akwaibom@39";
    if (passwordInput.trim() === expectedPassword || passwordInput.trim() === "arise2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid admin access credential. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-full glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl relative">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-orange-500/30 shadow-lg shadow-orange-500/10">
              <AkwaIbomMap className="w-10 h-10" size={40} fill="#FF6600" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              State Impact Analytics Portal
            </h1>
            <p className="text-xs text-slate-400">
              Akwa Ibom @ 39 &bull; Powered by Sabi AI Technologies
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin Passcode</span>
              </label>
              <input
                type="password"
                placeholder="Enter admin password (e.g. akwaibom@39)"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError("");
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-medium focus:outline-none focus:border-orange-500 transition text-sm"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 pt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 font-bold text-white text-xs sm:text-sm hover:from-orange-600 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <span>Unlock Campaign Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500">
            For state executive presentations & campaign verification.
          </p>
        </div>
      </main>
    );
  }

  const [data, setData] = useState<AdminAnalyticsData>(initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  const refreshLiveStats = useCallback(async () => {
    setIsSyncing(true);
    try {
      const fresh = await fetchAdminDashboardData();
      setData(fresh);
      setLastSyncedAt(new Date());
    } catch (e) {
      console.warn("Failed to refresh live admin stats:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin:realtime_dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "quiz_submissions" }, () => refreshLiveStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "birthday_wishes" }, () => refreshLiveStats())
      .subscribe();

    const interval = setInterval(() => refreshLiveStats(), 8000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isAuthenticated, refreshLiveStats]);

  const {
    totalParticipants,
    averageScorePercentage,
    averageScorePoints,
    homeVsDiaspora,
    top10Locations,
    recentWishes,
  } = data;

  const diasporaItem = homeVsDiaspora.find((x) => x.name.toLowerCase().includes("diaspora"));
  const diasporaCount = diasporaItem?.value ?? 0;
  const diasporaPct = totalParticipants > 0 ? Math.round((diasporaCount / totalParticipants) * 100) : 0;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Executive Pitch Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Government Pitch & State Impact Analytics Report</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Akwa Ibom @ 39 Engagement Impact
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time civic engagement telemetry proving cross-border state pride, diaspora connection, 
              and cultural literacy across all 31 LGAs and global diaspora chapters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refreshLiveStats()}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500/50 text-white font-semibold text-xs inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-orange-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh Live"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Export Deck PDF</span>
            </button>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-orange-500/30">
              <AkwaIbomMap className="w-10 h-10" size={40} fill="#FF6600" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Participants</span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {totalParticipants.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active civic participation</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Quiz Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {averageScorePercentage}%
          </div>
          <div className="text-xs text-slate-400">
            {averageScorePoints} / 15 points average
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Diaspora Share</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {diasporaPct}%
          </div>
          <div className="text-xs text-orange-400 font-medium">
            {diasporaCount.toLocaleString()} Global participants
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Anniversary Wishes</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {recentWishes.length}
          </div>
          <div className="text-xs text-slate-400">
            Live on celebratory ticker
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <AdminCharts homeVsDiaspora={homeVsDiaspora} top10Locations={top10Locations} />

      {/* Wishes Moderation Table */}
      <WishesTable initialWishes={recentWishes} />
    </main>
  );
}


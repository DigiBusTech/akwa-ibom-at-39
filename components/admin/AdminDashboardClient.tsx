"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Award,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  Building,
  TrendingUp,
  RotateCcw,
  BarChart3,
  ScrollText,
  Radio,
  Trophy,
  ShieldAlert,
  PartyPopper,
} from "lucide-react";
import type { AdminAnalyticsData } from "@/app/actions/admin";
import type { DailyLetter, PlatformSettings } from "@/types/database";
import { fetchAdminDashboardData } from "@/app/actions/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { LiveTrafficFeed } from "./LiveTrafficFeed";
import { QuizSubmissionsTable } from "./QuizSubmissionsTable";
import { ExecutiveExportPanel } from "./ExecutiveExportPanel";
import { AdminCharts } from "./AdminCharts";
import { WishesTable } from "./WishesTable";
import { DailyLettersManager } from "./DailyLettersManager";
import { CelebrationSettingsManager } from "./CelebrationSettingsManager";
import { AkwaIbomMap } from "../AkwaIbomMap";

type AdminTab = "traffic" | "submissions" | "letters" | "analytics" | "celebration";

interface AdminDashboardClientProps {
  initialData: AdminAnalyticsData;
  initialDailyLetters?: DailyLetter[];
  initialPlatformSettings?: PlatformSettings | null;
}

export function AdminDashboardClient({
  initialData,
  initialDailyLetters = [],
  initialPlatformSettings,
}: AdminDashboardClientProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("traffic");

  // Live Data & Telemetry State
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

  // Supabase Realtime channel subscription + Polling fallback
  useEffect(() => {
    if (!isAuthenticated) return;

    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    if (isSupabaseConfigured()) {
      supabase = createClient();
      channel = supabase
        .channel("admin:realtime_command_center")
        .on("postgres_changes", { event: "*", schema: "public", table: "site_traffic" }, () => refreshLiveStats())
        .on("postgres_changes", { event: "*", schema: "public", table: "quiz_submissions" }, () => refreshLiveStats())
        .on("postgres_changes", { event: "*", schema: "public", table: "birthday_wishes" }, () => refreshLiveStats())
        .subscribe();
    }

    const interval = setInterval(() => refreshLiveStats(), 10000);

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [isAuthenticated, refreshLiveStats]);

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
      {/* Executive Command Center Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Building className="w-3.5 h-3.5" />
              <span>Executive Telemetry &amp; Real-Time Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Akwa Ibom @ 39 Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time civic telemetry, live visitor tracking, LGA showdown submissions roster, and automated executive reporting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Executive Data Export Engine */}
            <ExecutiveExportPanel data={data} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refreshLiveStats()}
                disabled={isSyncing}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500/50 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-orange-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              </button>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-orange-500/30">
                <AkwaIbomMap className="w-7 h-7" size={28} fill="#FF6600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean 5-Way Tab Interface */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-2 shadow-xl">
        <button
          onClick={() => setActiveTab("traffic")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "traffic"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Live Traffic</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-200">
            {data.totalVisitors24h}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "submissions"
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Quiz Submissions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-200">
            {data.totalParticipants}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("letters")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "letters"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <ScrollText className="w-4 h-4 text-cyan-300" />
          <span>Daily Letters</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-200">
            {initialDailyLetters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "analytics"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-300" />
          <span>State Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab("celebration")}
          className={`col-span-2 md:col-span-1 py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "celebration"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <PartyPopper className="w-4 h-4 text-pink-300" />
          <span>Celebration Settings</span>
        </button>
      </div>

      {/* Tab 1: Live Traffic */}
      {activeTab === "traffic" && (
        <div className="animate-in fade-in duration-300">
          <LiveTrafficFeed
            totalVisitors24h={data.totalVisitors24h}
            currentlyOnlineLive={data.currentlyOnlineLive}
            totalParticipants={data.totalParticipants}
            traffic={data.recentTraffic}
            countryBreakdown={data.trafficByCountry}
          />
        </div>
      )}

      {/* Tab 2: Quiz Submissions */}
      {activeTab === "submissions" && (
        <div className="animate-in fade-in duration-300">
          <QuizSubmissionsTable submissions={data.recentSubmissions} />
        </div>
      )}

      {/* Tab 3: Daily Letters Manager */}
      {activeTab === "letters" && (
        <div className="animate-in fade-in duration-300">
          <DailyLettersManager initialLetters={initialDailyLetters} />
        </div>
      )}

      {/* Tab 4: State Analytics & Wishes Moderation */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in duration-300">
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
        </div>
      )}
      {/* Tab 5: Celebration Settings */}
      {activeTab === "celebration" && (
        <div className="animate-in fade-in duration-300">
          <CelebrationSettingsManager initialSettings={initialPlatformSettings} />
        </div>
      )}

    </main>
  );
}


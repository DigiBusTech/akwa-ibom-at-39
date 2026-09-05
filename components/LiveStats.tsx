"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Users, Globe, MapPin, Sparkles, ArrowRight } from "lucide-react";
import type { CampaignStats } from "@/app/actions/stats";
import { fetchCampaignStats } from "@/app/actions/stats";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface LiveStatsProps {
  initialStats?: CampaignStats;
}

export function LiveHeroCounter({ initialStats }: LiveStatsProps) {
  const [stats, setStats] = useState<CampaignStats | undefined>(initialStats);

  useEffect(() => {
    if (!stats) {
      fetchCampaignStats().then(setStats).catch(() => {});
    }

    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    if (isSupabaseConfigured()) {
      supabase = createClient();
      channel = supabase
        .channel("public:quiz_submissions_hero")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quiz_submissions" },
          async () => {
            try {
              const fresh = await fetchCampaignStats();
              setStats(fresh);
            } catch {}
          }
        )
        .subscribe();
    }

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchCampaignStats();
        setStats(fresh);
      } catch {}
    }, 10000);

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, []);

  const total = stats?.totalParticipants ?? 0;
  const formattedCount = Number(total).toLocaleString();

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/30 bg-slate-900/90 shadow-lg shadow-orange-500/10 backdrop-blur-md">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <Users className="w-4 h-4 text-orange-400" />
      <span className="text-xs sm:text-sm font-semibold text-slate-200">
        Join <span className="font-extrabold text-orange-400">{formattedCount}</span> Akwa Ibomites globally who have taken the test
      </span>
    </div>
  );
}

export function TopRegionsLeaderboard({ initialStats }: LiveStatsProps) {
  const [stats, setStats] = useState<CampaignStats | undefined>(initialStats);

  useEffect(() => {
    if (!stats) {
      fetchCampaignStats().then(setStats).catch(() => {});
    }

    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    if (isSupabaseConfigured()) {
      supabase = createClient();
      channel = supabase
        .channel("public:quiz_submissions_regions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quiz_submissions" },
          async () => {
            try {
              const fresh = await fetchCampaignStats();
              setStats(fresh);
            } catch {}
          }
        )
        .subscribe();
    }

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchCampaignStats();
        setStats(fresh);
      } catch {}
    }, 10000);

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, []);

  const medals = [
    { badge: "1st", color: "from-amber-400 to-yellow-600 text-slate-950", border: "border-amber-400/40" },
    { badge: "2nd", color: "from-slate-300 to-slate-400 text-slate-950", border: "border-slate-400/40" },
    { badge: "3rd", color: "from-amber-700 to-amber-900 text-amber-100", border: "border-amber-600/40" },
  ];

  const topRegions = stats?.topRegions ?? [];

  return (
    <div className="w-full rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Top Participating Regions Leaderboard
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-400" />
          Live demographic participation across 31 LGAs &amp; Diaspora
        </span>
      </div>

      {topRegions.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400 italic">
          No region entries recorded yet. Leaderboard rankings will populate live as citizens complete trivia.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topRegions.map((region, idx) => {
            const medal = medals[idx] || medals[2];
            return (
              <div
                key={region.name}
                className={`relative flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border ${medal.border} hover:bg-slate-900 transition`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${medal.color} font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {medal.badge}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{region.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      {region.type === "diaspora" ? (
                        <>
                          <Globe className="w-3 h-3 text-orange-400 inline" />
                          <span>Diaspora Chapter</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-emerald-400 inline" />
                          <span>Akwa Ibom Home</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-orange-400 shrink-0 ml-2">
                  {Number(region.count).toLocaleString()} participants
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Button to View Full Leaderboard Page */}
      <div className="pt-3 mt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <span className="text-[11px] text-slate-400">
          Home page displays top 3. View the complete table with full stats &amp; analysis:
        </span>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition py-1.5 px-3.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 shrink-0 group"
        >
          <span>View Full Leaderboard Rankings</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}

export default function LiveStats({ initialStats }: LiveStatsProps) {
  return (
    <div className="space-y-4">
      <TopRegionsLeaderboard initialStats={initialStats} />
    </div>
  );
}

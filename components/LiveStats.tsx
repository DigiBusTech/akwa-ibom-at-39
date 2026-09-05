import React from "react";
import { Trophy, Users, Globe, MapPin, Sparkles } from "lucide-react";
import { fetchCampaignStats } from "@/app/actions/stats";

export async function LiveHeroCounter() {
  const stats = await fetchCampaignStats();
  const formattedCount = Number(stats.totalParticipants).toLocaleString();

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/30 bg-slate-900/90 shadow-lg shadow-orange-500/10 backdrop-blur-md">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <Users className="w-4 h-4 text-orange-400" />
      <span className="text-xs sm:text-sm font-semibold text-slate-200">
        Join <span className="font-extrabold text-orange-400">{formattedCount}+</span> Akwa Ibomites globally who have taken the test
      </span>
    </div>
  );
}

export async function TopRegionsLeaderboard() {
  const stats = await fetchCampaignStats();
  const medals = [
    { badge: "1st", color: "from-amber-400 to-yellow-600 text-slate-950", border: "border-amber-400/40" },
    { badge: "2nd", color: "from-slate-300 to-slate-400 text-slate-950", border: "border-slate-400/40" },
    { badge: "3rd", color: "from-amber-700 to-amber-900 text-amber-100", border: "border-amber-600/40" },
  ];

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
          Live demographic participation across 31 LGAs & Diaspora
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.topRegions.map((region, idx) => {
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
    </div>
  );
}

export default async function LiveStats() {
  return (
    <div className="space-y-4">
      <TopRegionsLeaderboard />
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Globe,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Users,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  TrendingUp,
  MapPin,
  HelpCircle,
  BarChart3,
  X,
  MessageCircle,
} from "lucide-react";
import type { FullLeaderboardData, LgaLeaderboardEntry, DiasporaLeaderboardEntry } from "@/types/leaderboard";

interface Props {
  initialData: FullLeaderboardData;
}

export function LeaderboardClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<"home" | "diaspora" | "districts">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [diasporaShareModal, setDiasporaShareModal] = useState<DiasporaLeaderboardEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const { homeLgas, diasporaCountries, districtAnalytics, summary } = initialData;

  const filteredHomeLgas = useMemo(() => {
    return homeLgas.filter((item) => {
      const matchesSearch = item.lga.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict =
        selectedDistrict === "all" || item.senatorialDistrict.toLowerCase().includes(selectedDistrict.toLowerCase());
      return matchesSearch && matchesDistrict;
    });
  }, [homeLgas, searchQuery, selectedDistrict]);

  const filteredDiaspora = useMemo(() => {
    return diasporaCountries.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.country.toLowerCase().includes(q) ||
        item.chapters.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [diasporaCountries, searchQuery]);

  const copyDiasporaRallyMessage = (country: DiasporaLeaderboardEntry) => {
    const url = typeof window !== "undefined" ? window.location.origin + "/quiz" : "";
    const msg = `📢 CALLING ALL AKWA IBOMITES IN ${country.country.toUpperCase()} ${country.flag}!\n\nOur diaspora chapter is ranked #${country.rank} worldwide in the official Akwa Ibom @ 39 Statehood Jubilee Challenge with ${country.powerScore.toLocaleString()} Power Points!\n\nDefend our residence country now by scoring high on the 15-question trivia: ${url}\n\n#AkwaIbomAt39 #DiasporaShowdown #AriseAgenda`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>The Great 31 LGA &amp; Global Diaspora Heritage Showdown</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Akwa Ibom @ 39{" "}
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            Statehood Leaderboard
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
          Rankings are decided by the <strong>Heritage Power Index (HPI)</strong> — rewarding both civic mobilization turnout and trivia knowledge accuracy so every LGA and diaspora community has a fair chance to claim victory.
        </p>

        <div className="pt-1">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition py-1.5 px-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showFormulaInfo ? "Hide Scoring Methodology" : "How is the Winner Decided? (Click to view)"}</span>
          </button>
        </div>
      </div>
      {/* Scoring Methodology Collapsible Card */}
      {showFormulaInfo && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-orange-500/40 space-y-4 text-left animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              The Heritage Power Index (HPI) Formula
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A populous Local Government Area should not automatically defeat a smaller LGA purely on raw head count. To guarantee a fair, authentic contest ahead of September 23rd Statehood Day, the final ranking balances:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-bold text-emerald-400 uppercase">1. Knowledge Accuracy (50%)</div>
              <p className="text-xs text-slate-300 mt-1">
                Average percentage score per participant awards up to <strong>1,000 bonus points</strong>. Smart answers give smaller LGAs the power to lead!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-bold text-orange-400 uppercase">2. Total Points Earned</div>
              <p className="text-xs text-slate-300 mt-1">
                Every single question answered correctly adds directly to your LGA&apos;s cumulative point bank.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-bold text-amber-400 uppercase">3. Civic Mobilization</div>
              <p className="text-xs text-slate-300 mt-1">
                Each verified citizen participant adds 5 baseline points, rewarding communities that rally friends and family.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>#1 Home LGA</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1.5 truncate">
            {summary.topLga}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.topLgaPowerScore.toLocaleString()} Power Index
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-orange-500/30 text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>#1 Diaspora</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-300 mt-1.5 truncate flex items-center justify-center gap-1.5">
            <span>{summary.topDiasporaFlag}</span>
            <span>{summary.topDiasporaCountry}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.topDiasporaCountryPowerScore.toLocaleString()} Power Index
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Highest Accuracy</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5 truncate">
            {summary.highestAccuracyLga.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.highestAccuracyLga.pct}% Avg Accuracy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Citizens</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1.5">
            {summary.totalParticipants.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.homeParticipants} Home &bull; {summary.diasporaParticipants} Diaspora
          </div>
        </div>
      </div>
      {/* Main Tab Controller */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-2 shadow-xl">
        <button
          onClick={() => { setActiveTab("home"); setSearchQuery(""); }}
          className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer touch-manipulation ${
            activeTab === "home"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>31 Home LGAs</span>
          <span className="hidden sm:inline text-[11px] opacity-80">(31)</span>
        </button>

        <button
          onClick={() => { setActiveTab("diaspora"); setSearchQuery(""); }}
          className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer touch-manipulation ${
            activeTab === "diaspora"
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>Global Diaspora</span>
          <span className="hidden sm:inline text-[11px] opacity-80">({diasporaCountries.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab("districts"); setSearchQuery(""); }}
          className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer touch-manipulation ${
            activeTab === "districts"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Districts Analysis</span>
          <span className="hidden sm:inline text-[11px] opacity-80">(3)</span>
        </button>
      </div>

      {/* Search & Senatorial District Filter Bar (when in Home or Diaspora tab) */}
      {activeTab !== "districts" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === "home" ? "Search any of the 31 LGAs..." : "Search Diaspora country or chapter..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {activeTab === "home" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All 31 LGAs" },
                { id: "Uyo", label: "Uyo District" },
                { id: "Ikot Ekpene", label: "Ikot Ekpene District" },
                { id: "Eket", label: "Eket District" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedDistrict(pill.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedDistrict === pill.id
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: 31 Home LGAs Leaderboard */}
      {activeTab === "home" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Local Government Area</div>
              <div className="col-span-2 text-center">Mobilization</div>
              <div className="col-span-2 text-center">Accuracy &amp; Avg</div>
              <div className="col-span-1 text-center">Points</div>
              <div className="col-span-2 text-right">Power Index (HPI)</div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {filteredHomeLgas.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400 italic">No LGAs found matching &ldquo;{searchQuery}&rdquo;.</div>
              ) : (
                filteredHomeLgas.map((item) => (
                  <LgaRow key={item.lga} item={item} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Tab 2: Global Diaspora Leaderboard */}
      {activeTab === "diaspora" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-orange-500/15 border border-emerald-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Worldwide Akwa Ibom Diaspora Communities
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Akwa Ibomites residing abroad can rally their residence countries to climb the global jubilee leaderboard!
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Country &amp; Chapters</div>
              <div className="col-span-2 text-center">Turnout</div>
              <div className="col-span-2 text-center">Accuracy &amp; Avg</div>
              <div className="col-span-1 text-center">Points</div>
              <div className="col-span-2 text-right">Power Score</div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {filteredDiaspora.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400 italic">No diaspora countries found.</div>
              ) : (
                filteredDiaspora.map((country) => (
                  <DiasporaRow
                    key={country.country}
                    country={country}
                    onRally={() => copyDiasporaRallyMessage(country)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Tab 3: Senatorial Districts Analysis */}
      {activeTab === "districts" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {districtAnalytics.map((dist) => (
              <div
                key={dist.name}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-orange-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-xs font-bold text-orange-300">
                    {dist.shortName} District
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{dist.lgaCount} LGAs</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{dist.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Leading LGA: <strong className="text-amber-400">{dist.topLga} LGA</strong></p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total District Turnout:</span>
                    <span className="font-bold text-slate-200">{dist.participantCount.toLocaleString()} citizens</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Points Scored:</span>
                    <span className="font-bold font-mono text-amber-300">{dist.totalPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">District Avg Accuracy:</span>
                    <span className="font-bold text-emerald-400">{dist.averagePercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Average Points / Quiz:</span>
                    <span className="font-bold text-cyan-300">{dist.averageScore} / 15</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rally Callout Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-emerald-500/15 border border-orange-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Is your LGA or Country trailing behind?</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Every citizen who completes the 15-question trivia boosts their LGA&apos;s point bank and accuracy percentage on this live leaderboard. Defend your pride ahead of September 23rd!
          </p>
        </div>

        <Link
          href="/quiz"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-white text-sm shadow-lg shadow-orange-500/25 transition flex items-center gap-2 shrink-0 group"
        >
          <span>Take Trivia Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
        </Link>
      </div>

      {copied && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Diaspora Rally Message Copied to Clipboard!</span>
        </div>
      )}
    </div>
  );
}
function LgaRow({ item }: { item: LgaLeaderboardEntry }) {
  const isTop3 = item.rank <= 3;
  const medalBg =
    item.rank === 1
      ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/20"
      : item.rank === 2
      ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
      : item.rank === 3
      ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100"
      : "bg-slate-800 text-slate-300";

  return (
    <div
      className={`p-4 sm:px-6 sm:py-4 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 lg:gap-4 lg:items-center transition hover:bg-slate-850 ${
        isTop3 ? "bg-orange-500/[0.03]" : ""
      }`}
    >
      <div className="flex items-center justify-between lg:contents">
        <div className="lg:col-span-1 flex items-center lg:justify-center">
          <span className={`w-8 h-8 rounded-xl ${medalBg} font-black text-xs sm:text-sm flex items-center justify-center shrink-0`}>
            #{item.rank}
          </span>
        </div>

        <div className="lg:col-span-4 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{item.lga} LGA</h3>
            {item.rank === 1 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                #1 Pace
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{item.senatorialDistrict}</span>
          </p>
        </div>

        <div className="lg:hidden text-right">
          <span className="inline-block px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 font-black text-xs">
            {item.powerScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-2 text-xs py-1 lg:py-0 border-t border-slate-800/40 lg:border-t-0">
        <span className="lg:hidden text-slate-400">Turnout:</span>
        <div className="text-right lg:text-center">
          <span className="font-bold text-slate-200">{item.participantCount}</span>
          <span className="text-[11px] text-slate-400 ml-1">citizens</span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-2 text-xs py-1 lg:py-0">
        <span className="lg:hidden text-slate-400">Accuracy:</span>
        <div className="w-28 lg:w-full space-y-1 text-right lg:text-center">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-400">{item.averagePercentage}%</span>
            <span className="text-slate-400">({item.averageScore}/15)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, item.averagePercentage)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-1 text-xs py-1 lg:py-0">
        <span className="lg:hidden text-slate-400">Points:</span>
        <span className="font-mono font-bold text-amber-300">{item.totalPoints.toLocaleString()}</span>
      </div>

      <div className="hidden lg:flex flex-col items-end lg:col-span-2">
        <span className="text-base font-black text-white bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          {item.powerScore.toLocaleString()}
        </span>
        <Link href="/quiz" className="mt-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group">
          <span>Defend LGA</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}
function DiasporaRow({ country, onRally }: { country: DiasporaLeaderboardEntry; onRally: () => void }) {
  const isTop3 = country.rank <= 3;
  const medalBg =
    country.rank === 1
      ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/20"
      : country.rank === 2
      ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
      : country.rank === 3
      ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100"
      : "bg-slate-800 text-slate-300";

  return (
    <div
      className={`p-4 sm:px-6 sm:py-4 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 lg:gap-4 lg:items-center transition hover:bg-slate-850 ${
        isTop3 ? "bg-emerald-500/[0.03]" : ""
      }`}
    >
      <div className="flex items-center justify-between lg:contents">
        <div className="lg:col-span-1 flex items-center lg:justify-center">
          <span className={`w-8 h-8 rounded-xl ${medalBg} font-black text-xs sm:text-sm flex items-center justify-center shrink-0`}>
            #{country.rank}
          </span>
        </div>

        <div className="lg:col-span-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0">{country.flag}</span>
            <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{country.country}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Chapters: {country.chapters.join(", ") || "Global Network"}
          </p>
        </div>

        <div className="lg:hidden text-right">
          <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs">
            {country.powerScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-2 text-xs py-1 lg:py-0 border-t border-slate-800/40 lg:border-t-0">
        <span className="lg:hidden text-slate-400">Turnout:</span>
        <div className="text-right lg:text-center">
          <span className="font-bold text-slate-200">{country.participantCount}</span>
          <span className="text-[11px] text-slate-400 ml-1">citizens</span>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-2 text-xs py-1 lg:py-0">
        <span className="lg:hidden text-slate-400">Accuracy:</span>
        <div className="w-28 lg:w-full space-y-1 text-right lg:text-center">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-400">{country.averagePercentage}%</span>
            <span className="text-slate-400">({country.averageScore}/15)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, country.averagePercentage)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-center lg:col-span-1 text-xs py-1 lg:py-0">
        <span className="lg:hidden text-slate-400">Points:</span>
        <span className="font-mono font-bold text-amber-300">{country.totalPoints.toLocaleString()}</span>
      </div>

      <div className="flex items-center justify-between lg:flex-col lg:items-end lg:col-span-2 gap-1 pt-1 lg:pt-0">
        <span className="hidden lg:inline text-base font-black text-white bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          {country.powerScore.toLocaleString()}
        </span>
        <button
          onClick={onRally}
          className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Rally {country.country}</span>
        </button>
      </div>
    </div>
  );
}








import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Utensils, 
  Globe, 
  History, 
  Landmark,
  Camera,
  Heart,
  Share2,
  ExternalLink,
  Flame,
  Search,
  Layers,
  Trophy
} from "lucide-react";
import { fetchBirthdayWishes } from "@/app/actions/wishes";
import { fetchCampaignStats } from "@/app/actions/stats";
import { fetchTodayDailyLetter } from "@/app/actions/daily-letters";
import { fetchPlatformSettings } from "@/app/actions/settings";
import { BirthdayTicker } from "@/components/BirthdayTicker";
import { LiveHeroCounter, TopRegionsLeaderboard } from "@/components/LiveStats";
import { DailyLetterCard } from "@/components/DailyLetter";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";

export const revalidate = 10;

export default async function Home() {
  const [wishes, stats, todayLetter, platformSettings] = await Promise.all([
    fetchBirthdayWishes(),
    fetchCampaignStats(),
    fetchTodayDailyLetter(),
    fetchPlatformSettings(),
  ]);

  const categories = [
    { name: "Food & Cuisine", count: 3, icon: Utensils, color: "text-amber-400" },
    { name: "LGAs & Geography", count: 3, icon: MapPin, color: "text-emerald-400" },
    { name: "Languages & Cultural Heritage", count: 3, icon: Globe, color: "text-orange-400" },
    { name: "Past Leaders & History", count: 3, icon: History, color: "text-cyan-400" },
    { name: "Landmarks & State Milestones", count: 3, icon: Landmark, color: "text-yellow-400" },
  ];

  const securityHighlights = [
    {
      title: "Zero-Client-Trust Answer Masking",
      desc: "Answers & `is_correct` flags are never sent to the client bundle. Anon queries use secure `public_quiz_options` view.",
    },
    {
      title: "PostgreSQL Server-Side RPC Evaluation",
      desc: "Submissions are scored via `evaluate_quiz_submission()` PL/pgSQL function with SECURITY DEFINER isolation.",
    },
    {
      title: "Anti-Injection & XSS Protection",
      desc: "Parameterized queries with strict text sanitization and input length constraints (25 char name limit).",
    },
    {
      title: "Edge Rate Limiting & Bot Defense",
      desc: "Architected for Upstash Redis token bucket rate limiting on Edge Middleware.",
    },
  ];

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Scheduled Confetti & Fireworks Celebration Overlay */}
      <CelebrationOverlay initialSettings={platformSettings} />


      {/* 1. Main Hero Section: Explaining Platform & Showing Official DP Preview */}
      <section className="text-center space-y-8 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Commemorating 39 Years: 1987 – 2026</span>
            <span className="hidden sm:inline text-orange-400/50">•</span>
            <span className="hidden sm:inline text-orange-400">Land of Promise</span>
          </div>
          {/* Live Hero Demographic Counter */}
          <LiveHeroCounter initialStats={stats} />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="block text-white">Akwa Ibom @ 39</span>
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            Celebrating 39 Shades of Gratitude
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
          Bridging the hearts of proud Akwa Ibomites across all <strong>31 Local Government Areas</strong> and the 
          global <strong>Diaspora</strong>. Test your roots through 15 curated trivia questions, claim your verified heritage scorecard, 
          and download your commemorative display picture customized with state colors.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <Link 
              href="/quiz"
              className="relative px-7 py-3.5 rounded-xl bg-slate-950 font-bold text-white flex items-center gap-2.5 border border-slate-800 hover:bg-slate-900 transition shadow-xl"
            >
              <span>Take the 15-Question Trivia Challenge</span>
              <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition duration-200" />
            </Link>
          </div>

          <Link
            href="/dp"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 font-bold text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Create Sept 23rd DP Frame</span>
          </Link>

          <a 
            href="#root-connection"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 font-semibold text-slate-300 hover:text-white transition"
          >
            Root Connection Vision
          </a>
        </div>

        {/* DP Preview Showcase Card */}
        <div className="max-w-3xl mx-auto p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Frame Thumbnail */}
            <div className="md:col-span-5 flex justify-center">
              <Link href="/dp" className="block group/preview">
                <div className="w-48 sm:w-52 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl relative bg-slate-950 group-hover/preview:border-orange-500 transition-all duration-300 group-hover/preview:scale-[1.02]">
                  <img
                    src="/frames/official-state-frame-v2.png"
                    alt="Official Akwa Ibom @ 39 Statehood Anniversary DP Template"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 text-left">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-400 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm w-fit mb-1">
                      <Sparkles className="w-3 h-3" /> Auto AI Cutout
                    </span>
                    <p className="text-xs font-bold text-white leading-tight">Official 39th Jubilee Frame</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Click to Personalize &rarr;</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Explanatory Features */}
            <div className="md:col-span-7 text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Display Picture Studio</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                One-Click AI Background Removal &amp; Statehood Frame
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Upload your portrait photo and our client-side AI instantly strips the background, placing your portrait seamlessly over the statehood orange motif. No photo editing software needed.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400 font-medium">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto-BG Removal
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp &amp; IG Ready
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1080&times;1350 High-Res
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href="/dp"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-400 hover:text-orange-300 transition"
                >
                  <span>Launch DP Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* The 31 LGA Heritage Battle Promo Callout */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-emerald-500/15 border border-orange-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                The 31 LGA Showdown • 18 Days to Sept 23
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Top 3 LGAs with highest participation &amp; score points will be honored on September 23rd Statehood Day. Take the quiz, get your bragging rights card, and push your LGA to #1!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/leaderboard"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>View Leaderboard</span>
            </Link>
            <Link
              href="/quiz"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
            >
              <span>Take Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
      {/* Top Participating Regions Leaderboard (Moved directly after Hero Section) */}
      <TopRegionsLeaderboard initialStats={stats} />

      {/* Live Birthday Wishes Ticker */}
      <BirthdayTicker initialWishes={wishes} />


      {/* A Letter to Akwa Ibom: Daily Countdown Letter */}
      <section className="space-y-3">
        <DailyLetterCard initialLetter={todayLetter} />
      </section>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <div className="text-3xl font-black text-orange-400">31</div>
          <div className="text-xs sm:text-sm text-slate-400 mt-1">Local Government Areas</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <div className="text-3xl font-black text-emerald-400">15</div>
          <div className="text-xs sm:text-sm text-slate-400 mt-1">Production Trivia Questions</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <div className="text-3xl font-black text-amber-400">5</div>
          <div className="text-xs sm:text-sm text-slate-400 mt-1">Cultural Categories</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <div className="text-3xl font-black text-cyan-400">100%</div>
          <div className="text-xs sm:text-sm text-slate-400 mt-1">Zero-Client-Trust Masking</div>
        </div>
      </div>

      {/* Categories Bank Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Content Bank Categories
            </h2>
            <p className="text-sm text-slate-400">Seeded with 15 verified questions in <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-orange-300">supabase/seed.sql</code></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel p-5 rounded-xl border border-slate-800/80 hover:border-orange-500/40 transition flex items-start gap-4 group"
              >
                <div className={`p-3 rounded-lg bg-slate-900 border border-slate-800 ${cat.color} group-hover:scale-110 transition duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count} Questions Prepared</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Root Connection Vision: Home & Global Diaspora */}
      <section id="root-connection" className="glass-panel p-6 sm:p-8 rounded-3xl border border-orange-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Root Connection • Home & Global Diaspora</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              One Heritage. 31 LGAs. Millions Worldwide.
            </h2>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            The ARISE Agenda in Motion
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Sons & Daughters at Home</span>
            </h3>
            <p className="text-slate-400">
              From the capital city of Uyo to the shores of Ibeno, the hub of Eket, the crafts of Ikot Ekpene, 
              and maritime Oron—Akwa Ibom remains our sanctuary and eternal pride.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Global Diaspora Network</span>
            </h3>
            <p className="text-slate-400">
              Across the UK, US, Canada, Europe, South Africa, and Asia, our people shine. 
              Distance will never dim the pulse of our ancestral homeland or our culinary allegiance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verifiable Digital Identity</span>
            </h3>
            <p className="text-slate-400">
              Every completed quiz generates an authenticated digital scorecard on the system. Share your 1080x1080 DP 
              to WhatsApp, Facebook, Instagram, TikTok, X, and LinkedIn with a tamper-proof verification seal.
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Social Share Banner */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900/80 to-emerald-950/40 border border-slate-800 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <Share2 className="w-3.5 h-3.5" />
          <span>Multi-Platform Viral Campaign</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Showcase Your State Pride Across All Social Platforms
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          One-tap direct export to WhatsApp, Facebook, Instagram Stories, TikTok, X (Twitter), and LinkedIn:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-orange-300">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">#AkwaIbomAt39</span>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">#AriseAgenda</span>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">#39ShadesOfOrange</span>
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">#Dakkada</span>
        </div>
      </section>

      {/* Accreditation, Enterprise & Regulatory Credentials Footer */}
      <footer className="pt-8 border-t border-slate-800/80 space-y-6">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-slate-300">
            Akwa Ibom @ 39 Anniversary Trivia & DP Generator
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>
              Powered by{" "}
              <a 
                href="https://www.sabiaitech.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 font-bold underline"
              >
                Sabi AI Technologies Ltd
              </a>{" "}
              (www.sabiaitech.com)
            </p>
            <p>
              Founder & Orchestrator:{" "}
              <a 
                href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline font-medium inline-flex items-center gap-1"
              >
                Uyouko Nathaniel Ekpo
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>

          {/* Regulatory Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium">
              CAC Registered
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              NDPC Compliant
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
              NITDA Recognized
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
              National Startup Label
            </span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-900">
          Celebrating 39 years of peace, unity, and visionary transformation • Land of Promise • 1987 – 2026
        </div>
      </footer>
    </main>
  );
}

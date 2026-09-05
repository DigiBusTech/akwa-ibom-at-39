import React from "react";
import Link from "next/link";
import { 
  Award, 
  Sparkles, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  Share2, 
  MapPin, 
  User, 
  Crown,
  Flame,
  Camera
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DPGenerator } from "@/components/DPGenerator";

interface ResultPageProps {
  params: {
    id: string;
  };
  searchParams: {
    score?: string;
    total?: string;
    percentage?: string;
    badge?: string;
    name?: string;
    lga?: string;
  };
}

export async function generateMetadata({ params, searchParams }: ResultPageProps) {
  const name = searchParams.name || "Patriotic Citizen";
  const badge = searchParams.badge || "Akwa Ibom Citizen";
  const score = searchParams.score || "15";
  const total = searchParams.total || "15";
  const percentage = searchParams.percentage || "100";
  const lga = searchParams.lga || "Akwa Ibom";

  const ogUrl = `/api/og?name=${encodeURIComponent(name)}&badge=${encodeURIComponent(badge)}&score=${score}&total=${total}&percentage=${percentage}&lga=${encodeURIComponent(lga)}`;

  return {
    title: `${name}'s Akwa Ibom @ 39 Scorecard - ${badge}`,
    description: `${name} earned the ${badge} badge (${score}/${total}) on the Akwa Ibom @ 39 Anniversary Trivia!`,
    openGraph: {
      title: `${name}'s Akwa Ibom @ 39 Anniversary Scorecard`,
      description: `Official Commemorative Scorecard & DP: ${badge} (${percentage}%)`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: "Akwa Ibom @ 39 Commemorative Scorecard",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} is an Akwa Ibom ${badge}!`,
      description: `Celebrate Akwa Ibom @ 39: Test your roots and generate your personalized DP.`,
      images: [ogUrl],
    },
  };
}

export default async function QuizResultPage({ params, searchParams }: ResultPageProps) {
  let score = Number(searchParams.score) || 0;
  let total = Number(searchParams.total) || 15;
  let percentage = Number(searchParams.percentage) || Math.round((score / total) * 100);
  let badgeTitle = searchParams.badge || "Akwa Ibom Citizen";
  let userName = searchParams.name || "Patriotic Citizen";
  let userLga = searchParams.lga || "";

  // If searchParams were incomplete, attempt to fetch from Supabase quiz_submissions
  if (!searchParams.badge) {
    try {
      const supabase = await createClient();
      const { data: submission } = await supabase
        .from("quiz_submissions")
        .select("score, total_questions, badge_title, user_name, lga")
        .eq("id", params.id)
        .single();

      if (submission) {
        score = submission.score;
        total = submission.total_questions;
        percentage = Math.round((score / total) * 100);
        badgeTitle = submission.badge_title;
        userName = submission.user_name;
        userLga = submission.lga || "";
      }
    } catch {
      // Graceful fallback to default values
    }
  }

  // Badge Visual Theme Configuration
  const getBadgeConfig = (badge: string) => {
    switch (badge) {
      case "Pure Akwa Ibom Legend":
        return {
          icon: Crown,
          gradient: "from-amber-400 via-orange-400 to-yellow-300",
          border: "border-amber-400/40",
          bg: "bg-amber-500/10",
          tagBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
          quote: "Legendary knowledge! You are an undisputed cultural custodian of the Land of Promise.",
        };
      case "Dakkada Ambassador":
        return {
          icon: Award,
          gradient: "from-emerald-400 via-teal-300 to-cyan-400",
          border: "border-emerald-400/40",
          bg: "bg-emerald-500/10",
          tagBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
          quote: "Outstanding! You embody the vibrant spirit of 'Dakkada'—rising to greatness!",
        };
      case "Akwa Ibom Citizen":
        return {
          icon: Award,
          gradient: "from-orange-400 via-amber-300 to-emerald-400",
          border: "border-orange-400/40",
          bg: "bg-orange-500/10",
          tagBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
          quote: "Solid knowledge! You stand proud with strong roots across the 31 LGAs.",
        };
      default: // "JJC for Akwa Ibom"
        return {
          icon: Flame,
          gradient: "from-slate-300 via-slate-400 to-orange-300",
          border: "border-slate-700",
          bg: "bg-slate-900/60",
          tagBg: "bg-slate-800 text-slate-300 border-slate-700",
          quote: "Johnny Just Come! A good start—time to dive deeper into our heritage, Afang, and history.",
        };
    }
  };

  const badgeConfig = getBadgeConfig(badgeTitle);
  const BadgeIcon = badgeConfig.icon;

  return (
    <main className="min-h-[85vh] w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 flex flex-col justify-center space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Official 39th Anniversary Evaluation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Trivia Evaluation Complete!
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Here is your certified commemoration report for the Akwa Ibom State 39-year milestone.
        </p>
      </div>

      {/* Main Result Card */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl border ${badgeConfig.border} shadow-2xl space-y-6 relative overflow-hidden text-center`}>
        {/* Glow ambient background */}
        <div className="absolute -right-20 -top-20 w-56 h-56 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Icon Emblem */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-xl">
          <div className={`absolute inset-0 rounded-3xl ${badgeConfig.bg} blur-xl`} />
          <BadgeIcon className="w-12 h-12 sm:w-14 sm:h-14 text-orange-400 relative z-10" />
        </div>

        {/* Badge Title & Status */}
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold tracking-wide uppercase ${badgeConfig.tagBg}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badgeTitle}</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black bg-gradient-to-r ${badgeConfig.gradient} bg-clip-text text-transparent`}>
            {badgeTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto italic pt-1">
            "{badgeConfig.quote}"
          </p>
        </div>

        {/* User Info & Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>Candidate</span>
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {userName}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Origin / LGA</span>
            </div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {userLga || "Akwa Ibom"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Total Score</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              {score} / {total}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Accuracy</div>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {percentage}%
            </div>
          </div>
        </div>

        {/* Interactive Commemorative DP Generator & Multi-Social Share */}
        <div className="pt-2 border-t border-slate-800/80">
          <DPGenerator
            userName={userName}
            userLga={userLga}
            badgeTitle={badgeTitle}
            score={score}
            total={total}
            percentage={percentage}
            submissionId={params.id}
          />
        </div>

        {/* Accreditation & Regulatory Credentials */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2 text-xs">
          <div className="text-slate-300">
            Powered by{" "}
            <a 
              href="https://www.sabiaitech.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-orange-400 hover:text-orange-300 font-bold underline"
            >
              Sabi AI Technologies Ltd
            </a>
          </div>
          <div className="text-[11px] text-slate-400">
            Founder & Orchestrator:{" "}
            <a 
              href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-0.5"
            >
              Uyouko Nathaniel Ekpo
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px]">
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">CAC Registered</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">NDPC Compliant</span>
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">NITDA Recognized</span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">National Startup Label</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/quiz"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4 text-orange-400" />
            <span>Retake Quiz</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 font-bold text-white text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

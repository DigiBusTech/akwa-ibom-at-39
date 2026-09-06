import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, CheckCircle2, MapPin, Calendar, Sparkles, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchTodayDailyLetter } from "@/app/actions/daily-letters";
import { DailyLetterCard } from "@/components/DailyLetter";

interface VerifyProps {
  params: { id: string };
  searchParams: {
    score?: string;
    total?: string;
    percentage?: string;
    badge?: string;
    name?: string;
    lga?: string;
  };
}

export default async function VerifyPage({ params, searchParams }: VerifyProps) {
  let score = Number(searchParams.score) || 0;
  let total = Number(searchParams.total) || 15;
  let percentage = Number(searchParams.percentage) || Math.round((score / total) * 100);
  let badgeTitle = searchParams.badge || "Akwa Ibom Citizen";
  let userName = searchParams.name || "Akwa Ibomite";
  let userLga = searchParams.lga || "Akwa Ibom State";
  let verifiedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const todayLetter = await fetchTodayDailyLetter();

  try {
    const supabase = await createClient();
    const { data: sub } = await supabase.from("quiz_submissions").select("*").eq("id", params.id).single();
    if (sub) {
      score = sub.score;
      total = sub.total_questions;
      percentage = Math.round((score / total) * 100);
      badgeTitle = sub.badge_title;
      userName = sub.user_name;
      userLga = sub.lga || "Akwa Ibom State";
      verifiedDate = new Date(sub.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  } catch {}

  const resultUrl = `/quiz/result/${params.id}?score=${score}&total=${total}&percentage=${percentage}&badge=${encodeURIComponent(badgeTitle)}&name=${encodeURIComponent(userName)}&lga=${encodeURIComponent(userLga)}`;

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-950/90 border border-orange-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OFFICIAL HERITAGE VERIFICATION AUDIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Akwa Ibom @ 39 Scorecard</h1>
          <p className="text-xs text-slate-400">Authenticated record from the State Anniversary Trivia Evaluation Engine</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] uppercase font-mono text-slate-500">Candidate</span>
              <h2 className="text-xl font-bold text-white">{userName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-orange-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{userLga}</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-center">
              <div className="text-[10px] text-orange-300 uppercase font-semibold">Badge</div>
              <div className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{badgeTitle}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Score</span>
              <div className="text-lg font-bold text-emerald-400">{score} / {total}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
              <div className="text-lg font-bold text-amber-400">{percentage}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Status</span>
              <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <div className="flex justify-between">
              <span>Token:</span>
              <code className="text-[11px] text-slate-300 font-mono truncate max-w-[200px]">{params.id}</code>
            </div>
            <div className="flex justify-between">
              <span>Issued:</span>
              <span className="text-slate-300">{verifiedDate}</span>
            </div>
          </div>
        </div>

        {/* Accreditation & Regulatory Credentials */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-center text-xs">
          <div className="text-slate-300">
            Powered by{" "}
            <a href="https://www.sabiaitech.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold underline">
              Sabi AI Technologies Ltd
            </a>
          </div>
          <div className="text-[11px] text-slate-400">
            Founder & Orchestrator:{" "}
            <a href="https://www.linkedin.com/in/uyouko-nathaniel-ekpo-111b69396/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-0.5">
              Uyouko Nathaniel Ekpo <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">CAC Registered</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">NDPC Compliant</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">NITDA Recognized</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">National Startup Label</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href={resultUrl} className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 font-bold text-white text-xs sm:text-sm text-center shadow-lg hover:opacity-95 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Generate Commemorative DP</span>
          </Link>
          <Link href="/quiz" className="py-3 px-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm text-center hover:bg-slate-800">
            Take Trivia Challenge
          </Link>
        </div>
      </div>

      {/* Today's Commemorative Daily Letter */}
      <div className="w-full max-w-2xl mt-8">
        <DailyLetterCard initialLetter={todayLetter} />
      </div>
    </main>
  );
}

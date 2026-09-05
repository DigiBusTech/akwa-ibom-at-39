import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { fetchFullLeaderboard } from "@/app/actions/leaderboard";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";

export const revalidate = 15;

export const metadata: Metadata = {
  title: "31 LGA & Global Diaspora Leaderboard | Akwa Ibom @ 39 Statehood Jubilee",
  description:
    "Live official rankings across all 31 Local Government Areas and worldwide diaspora chapters for Akwa Ibom @ 39. Ranked by the Heritage Power Index balancing citizen mobilization turnout and trivia accuracy.",
  openGraph: {
    title: "Akwa Ibom @ 39 Official Leaderboard | 31 LGA & Diaspora Showdown",
    description:
      "Defend your LGA and residence country! Live demographic rankings decided by knowledge accuracy and civic mobilization ahead of September 23rd Statehood Day.",
  },
};

export default async function LeaderboardPage() {
  const leaderboardData = await fetchFullLeaderboard();

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/quiz"
            className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Take Trivia Challenge</span>
          </Link>
        </div>
      </div>

      {/* Interactive Leaderboard View */}
      <LeaderboardClient initialData={leaderboardData} />
    </main>
  );
}

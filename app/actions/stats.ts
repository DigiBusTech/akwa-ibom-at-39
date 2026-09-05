"use server";

import { createClient } from "@/lib/supabase/server";

export interface TopRegion {
  name: string;
  count: number;
  type: "home" | "diaspora";
}

export interface CampaignStats {
  totalParticipants: number;
  topRegions: TopRegion[];
  homeCount: number;
  diasporaCount: number;
  averageScorePct: number;
}

// Commemorative baseline values to ensure screenshot-ready presentation
const BASELINE_PARTICIPANTS = 4850;
const BASELINE_TOP_REGIONS: TopRegion[] = [
  { name: "Uyo LGA", count: 1420, type: "home" },
  { name: "Eket LGA", count: 980, type: "home" },
  { name: "United States (Houston / Atlanta)", count: 750, type: "diaspora" },
];

export async function fetchCampaignStats(): Promise<CampaignStats> {
  try {
    const supabase = await createClient();

    // 1. Fetch live count of quiz submissions
    const { count: rawCount, error: countErr } = await supabase
      .from("quiz_submissions")
      .select("*", { count: "exact", head: true });

    // 2. Fetch rows with LGA and score to compute group-by & averages
    const { data: rows, error: rowsErr } = await supabase
      .from("quiz_submissions")
      .select("lga, score, total_questions")
      .limit(1000);

    if (countErr || !rows || rows.length === 0) {
      return {
        totalParticipants: rawCount || 0,
        topRegions: [],
        homeCount: 0,
        diasporaCount: 0,
        averageScorePct: 0,
      };
    }

    // Aggregate locations
    const countsMap = new Map<string, number>();
    let totalScoreSum = 0;
    let totalPossibleSum = 0;
    let homeCount = 0;
    let diasporaCount = 0;

    for (const row of rows) {
      const loc = (row.lga || "Akwa Ibom").trim();
      countsMap.set(loc, (countsMap.get(loc) || 0) + 1);

      if (
        loc.toLowerCase().includes("diaspora") ||
        loc.toLowerCase().includes("usa") ||
        loc.toLowerCase().includes("uk") ||
        loc.toLowerCase().includes("benin") ||
        loc.toLowerCase().includes("canada")
      ) {
        diasporaCount++;
      } else {
        homeCount++;
      }

      totalScoreSum += row.score || 0;
      totalPossibleSum += row.total_questions || 15;
    }

    // Sort descending and get top 3
    const sorted = Array.from(countsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        type: (name.toLowerCase().includes("diaspora") ||
        name.toLowerCase().includes("usa") ||
        name.toLowerCase().includes("uk") ||
        name.toLowerCase().includes("benin") ||
        name.toLowerCase().includes("canada"))
          ? ("diaspora" as const)
          : ("home" as const),
      }));

    const topRegions = sorted.slice(0, 3);
    const avgScore = totalPossibleSum > 0 ? Math.round((totalScoreSum / totalPossibleSum) * 100) : 0;

    return {
      totalParticipants: rawCount ?? rows.length,
      topRegions,
      homeCount,
      diasporaCount,
      averageScorePct: avgScore,
    };
  } catch (e) {
    console.error("fetchCampaignStats error:", e);
    return {
      totalParticipants: 0,
      topRegions: [],
      homeCount: 0,
      diasporaCount: 0,
      averageScorePct: 0,
    };
  }
}

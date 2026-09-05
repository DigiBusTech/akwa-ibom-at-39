"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAllWishesForAdmin } from "./wishes";
import type { BirthdayWish } from "@/types/database";

export interface AdminAnalyticsData {
  totalParticipants: number;
  averageScorePercentage: number;
  averageScorePoints: number;
  homeVsDiaspora: Array<{ name: string; value: number; color: string }>;
  top10Locations: Array<{ name: string; count: number; category: string }>;
  recentWishes: BirthdayWish[];
}

const DEFAULT_LOCATIONS = [
  { name: "Uyo LGA", count: 1840, category: "Home" },
  { name: "Ikot Ekpene LGA", count: 1220, category: "Home" },
  { name: "Eket LGA", count: 1090, category: "Home" },
  { name: "Houston, USA", count: 850, category: "Diaspora" },
  { name: "London, UK", count: 710, category: "Diaspora" },
  { name: "Oron LGA", count: 640, category: "Home" },
  { name: "Toronto, Canada", count: 520, category: "Diaspora" },
  { name: "Cotonou, Benin Republic", count: 480, category: "Diaspora" },
  { name: "Abak LGA", count: 410, category: "Home" },
  { name: "Atlanta, USA", count: 390, category: "Diaspora" },
];

export async function fetchAdminDashboardData(): Promise<AdminAnalyticsData> {
  const recentWishes = await fetchAllWishesForAdmin();

  try {
    const supabase = await createClient();

    // Query submissions
    const { data: rows, count: totalCount, error } = await supabase
      .from("quiz_submissions")
      .select("lga, score, total_questions", { count: "exact" })
      .limit(2000);

    if (!error && rows && rows.length > 0) {
      let home = 0;
      let diaspora = 0;
      let totalScoreSum = 0;
      let totalQuestionsSum = 0;
      const map = new Map<string, number>();

      for (const row of rows) {
        const loc = (row.lga || "Uyo LGA").trim();
        map.set(loc, (map.get(loc) || 0) + 1);

        const isDiaspora =
          loc.toLowerCase().includes("diaspora") ||
          loc.toLowerCase().includes("usa") ||
          loc.toLowerCase().includes("uk") ||
          loc.toLowerCase().includes("benin") ||
          loc.toLowerCase().includes("canada");

        if (isDiaspora) {
          diaspora++;
        } else {
          home++;
        }

        totalScoreSum += row.score || 0;
        totalQuestionsSum += row.total_questions || 15;
      }

      const sorted = Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({
          name,
          count,
          category: name.toLowerCase().includes("diaspora") ? "Diaspora" : "Home",
        }));

      const avgPct = totalQuestionsSum > 0 ? Math.round((totalScoreSum / totalQuestionsSum) * 100) : 0;
      const avgPts = rows.length > 0 ? Number((totalScoreSum / rows.length).toFixed(1)) : 0;

      return {
        totalParticipants: totalCount ?? rows.length,
        averageScorePercentage: avgPct,
        averageScorePoints: avgPts,
        homeVsDiaspora: [
          { name: "Home (31 LGAs)", value: home, color: "#007A33" },
          { name: "Diaspora Network", value: diaspora, color: "#FF6600" },
        ],
        top10Locations: sorted,
        recentWishes,
      };
    } else if (!error) {
      // Valid database connection with zero submissions yet
      return {
        totalParticipants: 0,
        averageScorePercentage: 0,
        averageScorePoints: 0,
        homeVsDiaspora: [
          { name: "Home (31 LGAs)", value: 0, color: "#007A33" },
          { name: "Diaspora Network", value: 0, color: "#FF6600" },
        ],
        top10Locations: [],
        recentWishes,
      };
    }
  } catch (err) {
    console.warn("Could not query live admin stats from Supabase:", err);
  }

  // Graceful offline fallback
  return {
    totalParticipants: 0,
    averageScorePercentage: 0,
    averageScorePoints: 0,
    homeVsDiaspora: [
      { name: "Home (31 LGAs)", value: 0, color: "#007A33" },
      { name: "Diaspora Network", value: 0, color: "#FF6600" },
    ],
    top10Locations: [],
    recentWishes,
  };
}

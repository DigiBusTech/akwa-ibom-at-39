"use server";

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchAllWishesForAdmin } from "./wishes";
import { getCountryFlag, getCountryDisplayName } from "@/lib/country-flags";
import type { BirthdayWish } from "@/types/database";

export interface AdminQuizSubmission {
  id: string;
  user_name: string;
  lga: string;
  score: number;
  total_questions: number;
  badge_title: string;
  created_at: string;
}

export interface AdminTrafficEntry {
  id: string;
  ip_address: string;
  country_code: string;
  country_name: string;
  flag: string;
  page_route: string;
  visited_at: string;
  session_id: string | null;
}

export interface AdminAnalyticsData {
  totalVisitors24h: number;
  currentlyOnlineLive: number;
  totalParticipants: number;
  averageScorePercentage: number;
  averageScorePoints: number;
  topPerformingLga: string;
  homeVsDiaspora: Array<{ name: string; value: number; color: string }>;
  top10Locations: Array<{ name: string; count: number; category: string }>;
  trafficByCountry: Array<{ country: string; count: number; flag: string; percentage: number }>;
  lgaDistribution: Array<{ lga: string; participants: number; avgScore: number }>;
  recentTraffic: AdminTrafficEntry[];
  recentSubmissions: AdminQuizSubmission[];
  recentWishes: BirthdayWish[];
}

export async function fetchAdminDashboardData(): Promise<AdminAnalyticsData> {
  const recentWishes = await fetchAllWishesForAdmin();

  const emptyResult: AdminAnalyticsData = {
    totalVisitors24h: 0,
    currentlyOnlineLive: 0,
    totalParticipants: 0,
    averageScorePercentage: 0,
    averageScorePoints: 0,
    topPerformingLga: "Uyo LGA",
    homeVsDiaspora: [
      { name: "Home (31 LGAs)", value: 0, color: "#007A33" },
      { name: "Diaspora Network", value: 0, color: "#FF6600" },
    ],
    top10Locations: [],
    trafficByCountry: [],
    lgaDistribution: [],
    recentTraffic: [],
    recentSubmissions: [],
    recentWishes,
  };

  if (!isSupabaseConfigured()) {
    return emptyResult;
  }

  try {
    const supabase = createAdminClient();

    // 1. Fetch Quiz Submissions (latest for view and aggregation)
    const { data: submissionsData, count: totalSubmissionsCount } = await supabase
      .from("quiz_submissions")
      .select("id, user_name, lga, score, total_questions, badge_title, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000);

    const submissions: AdminQuizSubmission[] = (submissionsData || []).map((row) => ({
      id: row.id,
      user_name: row.user_name || "Proud Citizen",
      lga: row.lga || "Uyo LGA",
      score: row.score || 0,
      total_questions: row.total_questions || 15,
      badge_title: row.badge_title || "Heritage Ambassador",
      created_at: row.created_at || new Date().toISOString(),
    }));
    // Aggregations on Submissions
    let home = 0;
    let diaspora = 0;
    let totalScoreSum = 0;
    let totalQuestionsSum = 0;
    const lgaStatsMap = new Map<string, { count: number; totalScore: number }>();

    for (const sub of submissions) {
      const loc = (sub.lga || "Uyo LGA").trim();
      const existing = lgaStatsMap.get(loc) || { count: 0, totalScore: 0 };
      lgaStatsMap.set(loc, {
        count: existing.count + 1,
        totalScore: existing.totalScore + sub.score,
      });

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

      totalScoreSum += sub.score;
      totalQuestionsSum += sub.total_questions;
    }

    const sortedLocations = Array.from(lgaStatsMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, stat]) => ({
        lga: name,
        participants: stat.count,
        avgScore: stat.count > 0 ? Number((stat.totalScore / stat.count).toFixed(1)) : 0,
      }));

    const top10Locations = sortedLocations.slice(0, 10).map((item) => ({
      name: item.lga,
      count: item.participants,
      category: item.lga.toLowerCase().includes("diaspora") ? "Diaspora" : "Home",
    }));

    const topPerformingLga = sortedLocations.length > 0 ? sortedLocations[0].lga : "Uyo LGA";
    const avgPct = totalQuestionsSum > 0 ? Math.round((totalScoreSum / totalQuestionsSum) * 100) : 0;
    const avgPts = submissions.length > 0 ? Number((totalScoreSum / submissions.length).toFixed(1)) : 0;

    // 2. Fetch Site Traffic Telemetry
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // Query 24h count
    const { count: count24h } = await supabase
      .from("site_traffic")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", twentyFourHoursAgo);

    // Query 5m live active count (distinct sessions)
    const { data: liveData } = await supabase
      .from("site_traffic")
      .select("session_id")
      .gte("visited_at", fiveMinutesAgo);

    const liveSessions = new Set((liveData || []).map((d) => d.session_id).filter(Boolean));
    const liveOnlineCount = Math.max(liveSessions.size, liveData?.length ? 1 : 0);

    // Query recent 100 traffic visits
    const { data: trafficRows } = await supabase
      .from("site_traffic")
      .select("id, ip_address, country_code, page_route, visited_at, session_id")
      .order("visited_at", { ascending: false })
      .limit(100);

    const recentTraffic: AdminTrafficEntry[] = (trafficRows || []).map((row) => ({
      id: row.id,
      ip_address: row.ip_address || "127.0.0.1",
      country_code: row.country_code || "NG",
      country_name: getCountryDisplayName(row.country_code),
      flag: getCountryFlag(row.country_code),
      page_route: row.page_route || "/",
      visited_at: row.visited_at || new Date().toISOString(),
      session_id: row.session_id,
    }));

    // Aggregate Country Distribution from recent traffic
    const countryMap = new Map<string, number>();
    for (const t of recentTraffic) {
      const c = t.country_code || "NG";
      countryMap.set(c, (countryMap.get(c) || 0) + 1);
    }

    const totalTrafficSample = recentTraffic.length || 1;
    const trafficByCountry = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([code, count]) => ({
        country: getCountryDisplayName(code),
        count,
        flag: getCountryFlag(code),
        percentage: Math.round((count / totalTrafficSample) * 100),
      }));

    return {
      totalVisitors24h: count24h ?? recentTraffic.length,
      currentlyOnlineLive: liveOnlineCount,
      totalParticipants: totalSubmissionsCount ?? submissions.length,
      averageScorePercentage: avgPct,
      averageScorePoints: avgPts,
      topPerformingLga,
      homeVsDiaspora: [
        { name: "Home (31 LGAs)", value: home, color: "#007A33" },
        { name: "Diaspora Network", value: diaspora, color: "#FF6600" },
      ],
      top10Locations,
      trafficByCountry,
      lgaDistribution: sortedLocations.slice(0, 15),
      recentTraffic,
      recentSubmissions: submissions,
      recentWishes,
    };
  } catch (err) {
    console.warn("Could not query live admin stats from Supabase:", err);
    return emptyResult;
  }
}

/**
 * Fetches all raw quiz submissions for CSV export engine
 */
export async function fetchAllQuizSubmissionsForExport(): Promise<AdminQuizSubmission[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("quiz_submissions")
      .select("id, user_name, lga, score, total_questions, badge_title, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      user_name: row.user_name || "Proud Citizen",
      lga: row.lga || "Uyo LGA",
      score: row.score || 0,
      total_questions: row.total_questions || 15,
      badge_title: row.badge_title || "Heritage Ambassador",
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Export fetch error:", e);
    return [];
  }
}


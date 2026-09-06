"use client";

import React, { useState, useRef } from "react";
import { Table, FileText, Loader2 } from "lucide-react";
import type { AdminAnalyticsData } from "@/app/actions/admin";
import { fetchAllQuizSubmissionsForExport } from "@/app/actions/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ExecutiveExportPanelProps {
  data: AdminAnalyticsData;
}

const PIE_COLORS = ["#FF6600", "#007A33", "#00A859", "#FFA200", "#3B82F6", "#8B5CF6", "#EC4899", "#64748B"];

export function ExecutiveExportPanel({ data }: ExecutiveExportPanelProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // 1. CSV Export Handler
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const submissions = await fetchAllQuizSubmissionsForExport();
      const rowsToExport = submissions.length > 0 ? submissions : data.recentSubmissions;

      const headers = [
        "Participant Name",
        "LGA / Chapter",
        "Score",
        "Total Questions",
        "Score Percentage",
        "Badge Title",
        "Submission Timestamp",
      ];

      const csvRows = [headers.join(",")];

      for (const row of rowsToExport) {
        const pct = row.total_questions > 0 ? Math.round((row.score / row.total_questions) * 100) : 0;
        const escapedName = `"${row.user_name.replace(/"/g, '""')}"`;
        const escapedLga = `"${row.lga.replace(/"/g, '""')}"`;
        const escapedBadge = `"${row.badge_title.replace(/"/g, '""')}"`;
        const escapedDate = `"${new Date(row.created_at).toISOString()}"`;

        csvRows.push([
          escapedName,
          escapedLga,
          row.score,
          row.total_questions,
          `${pct}%`,
          escapedBadge,
          escapedDate,
        ].join(","));
      }

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AkwaIbomAt39_Quiz_Participants_Raw_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export failed:", err);
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 2. PDF Export Handler
  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#030712",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AkwaIbomAt39_Executive_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const chartDataLga = data.lgaDistribution.slice(0, 8).map((item) => ({
    lga: item.lga.replace(" LGA", ""),
    participants: item.participants,
  }));

  const chartDataCountry = data.trafficByCountry.slice(0, 6).map((item) => ({
    name: item.country,
    value: item.count,
  }));

  return (
    <>
      {/* Executive Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExportingCsv}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
        >
          {isExportingCsv ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
          ) : (
            <Table className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isExportingCsv ? "Generating CSV..." : "Export CSV (Raw Submissions)"}</span>
        </button>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExportingPdf}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-orange-500/20"
        >
          {isExportingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <FileText className="w-4 h-4 text-white" />
          )}
          <span>{isExportingPdf ? "Rendering PDF..." : "Export Executive PDF Report"}</span>
        </button>
      </div>

      {/* OFF-SCREEN EXECUTIVE PDF TEMPLATE FOR html2canvas */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <div
          ref={reportRef}
          className="w-[850px] bg-slate-950 text-white p-10 space-y-8 font-sans border border-slate-800"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-orange-500 pb-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Statehood Jubilee Telemetry
                </span>
                <span className="text-xs text-emerald-400 font-bold">1987 — 2026</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Akwa Ibom @ 39 Anniversary Executive Report
              </h1>
              <p className="text-xs text-slate-400">
                Civic Engagement, Leaderboard &amp; Edge Traffic Analytics
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p className="font-semibold text-white">Generated Date:</p>
              <p className="font-mono text-emerald-400">{new Date().toLocaleDateString()}</p>
              <p className="font-mono text-slate-500">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* High-Level Executive Summary Text */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Participants</p>
              <p className="text-2xl font-black text-white mt-1">{data.totalParticipants.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Verified Quiz Submissions</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">24h Site Visitors</p>
              <p className="text-2xl font-black text-orange-400 mt-1">{data.totalVisitors24h.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Edge Middleware Telemetry</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Top Performing LGA</p>
              <p className="text-base font-black text-white mt-1 truncate">{data.topPerformingLga}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">#1 Mobilization Leader</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Average Score</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{data.averageScorePercentage}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">({data.averageScorePoints} / 15 points)</p>
            </div>
          </div>

          {/* Dynamic Charts Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Chart 1: Participation by LGA (Bar Chart) */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span>Participation by LGA (Top 8)</span>
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataLga} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="lga"
                      stroke="#94A3B8"
                      fontSize={10}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Bar dataKey="participants" fill="#FF6600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Traffic by Country (Pie Chart) */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Traffic by Country Distribution</span>
              </h3>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataCountry.length > 0 ? chartDataCountry : [{ name: "Nigeria", value: 100 }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => `${entry.name} (${entry.value})`}
                    >
                      {chartDataCountry.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top 5 LGA Leaderboard */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              The 31 LGA Mobilization Leaderboard (Top 5)
            </h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {data.top10Locations.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-orange-400 font-bold">Rank #{idx + 1}</p>
                  <p className="font-semibold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{item.count} citizens</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Credentials */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <div>
              <p className="text-slate-400 font-semibold">Akwa Ibom @ 39 Statehood Jubilee Telemetry</p>
              <p>Powered by Sabi AI Technologies Ltd &bull; Founder: Uyouko Nathaniel Ekpo</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-medium">NDPC Compliant &bull; NITDA Recognized &bull; CAC Registered</p>
              <p>Confidential Executive Briefing Document</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

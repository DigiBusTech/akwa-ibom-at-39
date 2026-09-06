"use client";

import React, { useState } from "react";
import {
  Users,
  Radio,
  Globe2,
  Clock,
  Search,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import type { AdminTrafficEntry } from "@/app/actions/admin";
import { TablePagination } from "./TablePagination";

interface LiveTrafficFeedProps {
  totalVisitors24h: number;
  currentlyOnlineLive: number;
  totalParticipants: number;
  traffic: AdminTrafficEntry[];
  countryBreakdown: Array<{ country: string; count: number; flag: string; percentage: number }>;
}

export function LiveTrafficFeed({
  totalVisitors24h,
  currentlyOnlineLive,
  totalParticipants,
  traffic,
  countryBreakdown,
}: LiveTrafficFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredTraffic = traffic.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.ip_address.toLowerCase().includes(q) ||
      item.country_name.toLowerCase().includes(q) ||
      item.country_code.toLowerCase().includes(q) ||
      item.page_route.toLowerCase().includes(q)
    );
  });

  const paginatedTraffic = filteredTraffic.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Visitors (24h) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Visitors (24h)
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {totalVisitors24h.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            <span>Telemetry logged via Edge Middleware</span>
          </p>
        </div>

        {/* Currently Online (Live) */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Currently Online (Live)</span>
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 tracking-tight">
            {currentlyOnlineLive}
          </div>
          <p className="text-[11px] text-emerald-400/80">
            Active browser sessions within last 5 minutes
          </p>
        </div>

        {/* Total Quiz Takers */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Quiz Takers
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {totalParticipants.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified PostgreSQL submissions</span>
          </p>
        </div>
      </div>

      {/* 2. Country Breakdown Chips */}
      {countryBreakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Geographic Visitor Distribution</span>
            </span>
            <span className="text-[11px] text-slate-500">Auto-detected by Edge Headers</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {countryBreakdown.map((item) => (
              <span
                key={item.country}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
              >
                <span>{item.flag}</span>
                <span>{item.country}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-orange-300">
                  {item.count} ({item.percentage}%)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Real-Time Telemetry Feed Table */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Live Edge Traffic Feed ({filteredTraffic.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by IP, Country, Route..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Origin / Flag</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Page Route</th>
                <th className="py-3 px-4">Session Ref</th>
                <th className="py-3 px-4 text-right">Visited Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTraffic.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-sans whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs">
                      <span>{item.flag}</span>
                      <span className="font-semibold">{item.country_name}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                    {item.ip_address}
                  </td>
                  <td className="py-3 px-4 font-sans whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 font-medium inline-flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {item.page_route}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {item.session_id ? item.session_id.slice(0, 8) + "..." : "Anonymous"}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-sans">
                    <span className="text-slate-200 font-medium flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.visited_at).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(item.visited_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedTraffic.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 font-sans">
                    No traffic activity matches current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={filteredTraffic.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Award, Trophy, Search, CheckCircle2, Calendar, MapPin } from "lucide-react";
import type { AdminQuizSubmission } from "@/app/actions/admin";
import { TablePagination } from "./TablePagination";

interface QuizSubmissionsTableProps {
  submissions: AdminQuizSubmission[];
}

export function QuizSubmissionsTable({ submissions }: QuizSubmissionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sub.user_name.toLowerCase().includes(q) ||
      sub.lga.toLowerCase().includes(q) ||
      sub.badge_title.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Verified Quiz Submissions ({filtered.length})
          </h3>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search citizen name or LGA..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase tracking-wider bg-slate-900/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Participant Name</th>
              <th className="py-3 px-4">LGA / Diaspora</th>
              <th className="py-3 px-4">Anniversary Badge</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {paginated.map((sub) => {
              const pct = sub.total_questions > 0 ? Math.round((sub.score / sub.total_questions) * 100) : 0;
              const isHighScore = pct >= 80;

              return (
                <tr key={sub.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-[11px]">
                        {sub.user_name.charAt(0).toUpperCase()}
                      </span>
                      <span>{sub.user_name}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-900 text-slate-200 border border-slate-700">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{sub.lga}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium">{sub.badge_title}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        isHighScore
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {isHighScore && <CheckCircle2 className="w-3 h-3" />}
                      <span>
                        {sub.score}/{sub.total_questions} ({pct}%)
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap text-slate-400">
                    <span className="flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(sub.created_at).toLocaleTimeString()}
                    </span>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500">
                  No submissions found matching current search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

"use client";

import React from "react";
import { X, History, CheckCircle2 } from "lucide-react";
import type { AdminTrafficEntry } from "@/app/actions/admin";

interface VisitorJourneyModalProps {
  visitor: AdminTrafficEntry;
  onClose: () => void;
}

export function VisitorJourneyModal({
  visitor,
  onClose,
}: VisitorJourneyModalProps) {
  const historyList = visitor.route_history || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{visitor.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Device Navigation Journey
                </h3>
                {visitor.is_online ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active Live
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                    Recent Session
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <span>{visitor.ip_address}</span>
                <span>&bull;</span>
                <span>{visitor.country_name}</span>
                <span>&bull;</span>
                <span className="text-orange-400">{visitor.device_id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Stats Bar */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/30 border-b border-slate-800/60 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Current Route
            </span>
            <p className="font-bold text-orange-400 truncate">
              {visitor.page_route}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Total Navigations
            </span>
            <p className="font-bold text-white">
              {visitor.total_visits} {visitor.total_visits === 1 ? "hit" : "hits"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              First Detected
            </span>
            <p className="font-medium text-slate-300">
              {new Date(visitor.first_seen_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Last Active
            </span>
            <p className="font-medium text-emerald-400">
              {new Date(visitor.visited_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>
        {/* Route History Timeline */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span>Route Navigation History (Chronological Trail)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {historyList.length || 1} routes recorded
            </span>
          </div>

          {historyList.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-emerald-500/40 before:to-slate-800">
              {historyList.map((step, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={`${step.route}-${step.timestamp}-${idx}`} className="relative group">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 ${
                        isLatest
                          ? "bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(255,102,0,0.6)]"
                          : "bg-slate-950 border-slate-600"
                      }`}
                    />

                    {/* Step Card */}
                    <div
                      className={`p-3 rounded-xl border text-xs transition ${
                        isLatest
                          ? "bg-orange-500/10 border-orange-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {step.route}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-slate-950 uppercase">
                              Current Location
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(step.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                        <span>
                          {isLatest
                            ? "Latest page navigation"
                            : `Step #${historyList.length - idx}`}
                        </span>
                        <span>{new Date(step.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Initial Landing on <strong className="text-white">{visitor.page_route}</strong>.
                Subsequent navigations will appear here.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Device Ref: {visitor.device_id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Journey
          </button>
        </div>
      </div>
    </div>
  );
}

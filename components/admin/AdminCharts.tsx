"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface AdminChartsProps {
  homeVsDiaspora: Array<{ name: string; value: number; color: string }>;
  top10Locations: Array<{ name: string; count: number; category: string }>;
}

export function AdminCharts({ homeVsDiaspora, top10Locations }: AdminChartsProps) {
  const totalSubmissions = homeVsDiaspora.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Home vs. Diaspora Split Pie Chart */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Demographic Reach: Home vs. Diaspora
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across Akwa Ibom&apos;s 31 LGAs vs global diaspora chapters
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {totalSubmissions.toLocaleString()} Total
          </span>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={homeVsDiaspora}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name?.split(" ")[0]} ${(Number(percent || 0) * 100).toFixed(0)}%`
                }
              >
                {homeVsDiaspora.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [Number(val || 0).toLocaleString(), "Participants"]}
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Participating Locations Bar Chart */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Top 10 Participating Locations
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by participant engagement volume
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            Cross-Border
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top10Locations}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                width={100}
                tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 12)}…` : val)}
              />
              <Tooltip
                formatter={(val: any) => [Number(val || 0).toLocaleString(), "Participants"]}
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#FF6600" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

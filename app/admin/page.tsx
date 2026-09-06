import React from "react";
import { fetchAdminDashboardData } from "@/app/actions/admin";
import { fetchAllDailyLettersAdmin } from "@/app/actions/daily-letters";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata = {
  title: "Admin Analytics & Impact Portal | Akwa Ibom @ 39",
  description:
    "Confidential executive telemetry, countdown letters management, and campaign impact analytics dashboard for state officials and leadership.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [data, dailyLetters] = await Promise.all([
    fetchAdminDashboardData(),
    fetchAllDailyLettersAdmin(),
  ]);

  return <AdminDashboardClient initialData={data} initialDailyLetters={dailyLetters} />;
}


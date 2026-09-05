import React from "react";
import { fetchAdminDashboardData } from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata = {
  title: "Admin Analytics & Impact Portal | Akwa Ibom @ 39",
  description:
    "Confidential executive telemetry and campaign impact analytics dashboard for state officials and leadership.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await fetchAdminDashboardData();

  return <AdminDashboardClient initialData={data} />;
}

import { NextResponse } from "next/server";
import { fetchPlatformSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await fetchPlatformSettings();
    return NextResponse.json({
      success: true,
      confetti_start_time: settings.confetti_start_time,
      confetti_end_time: settings.confetti_end_time,
      updated_at: settings.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch platform settings",
      },
      { status: 500 }
    );
  }
}

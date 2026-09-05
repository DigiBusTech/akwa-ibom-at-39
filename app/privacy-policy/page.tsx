import React from "react";
import Link from "next/link";
import { Lock, ArrowLeft, Cookie, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Akwa Ibom @ 39 Celebration",
  description:
    "Privacy and data practices for the Akwa Ibom @ 39 Anniversary Trivia and DP Generator.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
          <Lock className="w-4 h-4" />
          <span>Data Privacy Principles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            1. Scope & Purpose of Data Collection
          </h2>
          <p>
            Your privacy is of utmost importance to us. User data collected through this platform is restricted strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li>
              <strong>Generating the Celebratory Scorecard:</strong> The name or nickname you submit is used solely to generate your dynamic anniversary scorecard, verification certificate, and social preview badges.
            </li>
            <li>
              <strong>Anonymous Demographic Statistics:</strong> Your selected LGA or Diaspora location is grouped into high-level, aggregate statistics (such as total participation per region) for the public campaign counter and impact analytics.
            </li>
          </ul>
          <p>
            We do not collect passwords, phone numbers, home addresses, or financial information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-400" />
            2. Local Storage & Cookie Usage
          </h2>
          <p>
            Cookies and browser LocalStorage are used exclusively for saving your active quiz session locally on your device. This ensures you can complete your trivia questions without losing progress if your connection drops or your browser refreshes. No cross-site tracking or commercial advertising cookies are employed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Zero Image Storing (DP Generator)</h2>
          <p>
            When utilizing the Akwa Ibom @ 39 DP Generator to frame your photo, your personal picture is drawn exclusively inside your browser&apos;s HTML5 Canvas element. The composite 1080x1080 PNG is downloaded directly to your local files. <strong>Your personal photos are never transmitted to our servers or stored in any database.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Data Deletion & Inquiries</h2>
          <p>
            If you wish to have a submitted public birthday wish or leaderboard entry removed, contact our team at{" "}
            <a
              href="https://www.sabiaitech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              sabiaitech.com
            </a>{" "}
            and we will fulfill your request promptly.
          </p>
        </section>
      </div>
    </main>
  );
}

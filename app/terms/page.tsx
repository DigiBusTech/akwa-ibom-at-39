import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use | Akwa Ibom @ 39 Celebration",
  description: "Terms and conditions of using the Akwa Ibom @ 39 Anniversary Trivia and DP Generator.",
};

export default function TermsPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <FileText className="w-4 h-4" />
          <span>Usage Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Use
        </h1>
        <p className="text-sm text-slate-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Akwa Ibom @ 39 Anniversary Trivia & DP Generator, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please refrain from participating.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Permitted Use & User Content</h2>
          <p>
            This service allows you to test your knowledge of Akwa Ibom State history and generate customized celebratory graphics. When submitting your name, chosen location, or birthday wishes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li>You agree not to post defamatory, offensive, discriminatory, or politically partisan content.</li>
            <li>You agree not to attempt to bypass rate limits or compromise server security.</li>
            <li>Public wishes are moderated and administrators reserve the right to remove non-compliant text.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Intellectual Property & Image Rights</h2>
          <p>
            When you generate a Display Picture (DP), your uploaded photo is processed entirely client-side in your web browser. No copy of your personal photo is uploaded or stored on our external servers. You retain full ownership of any personal images you choose to incorporate into your celebratory badge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Modifications & Availability</h2>
          <p>
            Sabi AI Technologies reserves the right to modify or discontinue any aspect of this celebratory experience at any time without prior notice.
          </p>
        </section>
      </div>
    </main>
  );
}

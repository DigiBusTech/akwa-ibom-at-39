import { AkwaIbomMap } from "@/components/AkwaIbomMap";

export default function QuizLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 max-w-2xl mx-auto w-full">
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-pulse">
        {/* Top Header Placeholder */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800">
              <AkwaIbomMap className="w-6 h-6 opacity-60" size={24} fill="#FF6600" />
            </div>
            <div className="h-4 w-32 bg-slate-800 rounded" />
          </div>
          <div className="h-6 w-16 bg-slate-800 rounded-full" />
        </div>

        {/* Question Text Placeholder */}
        <div className="space-y-2 py-4">
          <div className="h-5 w-3/4 bg-slate-800 rounded" />
          <div className="h-5 w-1/2 bg-slate-800/60 rounded" />
        </div>

        {/* Options Placeholder */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-slate-800/40 border border-slate-800/60 flex items-center px-4"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-700/50 mr-3" />
              <div className="h-4 w-1/2 bg-slate-700/40 rounded" />
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <div className="h-4 w-24 bg-slate-800 rounded" />
          <div className="h-9 w-28 bg-orange-500/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

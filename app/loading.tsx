import { AkwaIbomMap } from "@/components/AkwaIbomMap";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative flex flex-col items-center">
        {/* Pulsing glow background */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-emerald-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse" />

        {/* Akwa Ibom Emblem */}
        <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30 shadow-xl shadow-orange-500/10 mb-4 animate-bounce">
          <AkwaIbomMap className="w-12 h-12" size={48} fill="#FF6600" />
        </div>

        {/* Text indicator */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Loading Akwa Ibom @ 39...</span>
        </div>

        <p className="text-xs text-slate-500 mt-1">Celebrating 39 Years of Heritage & Glory</p>
      </div>
    </div>
  );
}

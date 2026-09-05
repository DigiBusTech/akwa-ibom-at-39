export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded" />
          <div className="h-4 w-48 bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-8 w-20 bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6" />
        <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6" />
      </div>
    </div>
  );
}

interface StatsCardProps {
  clientCount: number;
  meetingCount: number;
  todosDone: number;
  todosTotal: number;
  hotClients: number;
  warmClients: number;
  coldClients: number;
}

export default function StatsCard({
  clientCount,
  meetingCount,
  todosDone,
  todosTotal,
  hotClients,
  warmClients,
  coldClients,
}: StatsCardProps) {
  const total = hotClients + warmClients + coldClients || 1;
  const hotPct = (hotClients / total) * 100;
  const warmPct = (warmClients / total) * 100;
  const coldPct = (coldClients / total) * 100;

  const statBoxClass =
    'bg-white/40 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-sm';

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 flex flex-col p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-6">📊 Your Relationships</h2>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={statBoxClass}>
          <span className="text-3xl font-bold text-[#1a1a2e]">{clientCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Clients</span>
        </div>
        <div className={statBoxClass}>
          <span className="text-3xl font-bold text-[#1a1a2e]">{meetingCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Meetings</span>
        </div>
        <div className={statBoxClass}>
          <span className="text-3xl font-bold text-[#1a1a2e]">{todosDone}/{todosTotal}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Tasks Done</span>
        </div>
        <div className={statBoxClass}>
          <span className="text-3xl font-bold text-[#1a1a2e]">{hotClients}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Hot Leads</span>
        </div>
      </div>

      {/* Relationship health bar */}
      <div className="mt-auto">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Relationship Health</p>
        <div className="w-full h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${hotPct}%` }}
          />
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${warmPct}%` }}
          />
          <div
            className="bg-rose-400 h-full transition-all"
            style={{ width: `${coldPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-2">
          🔥 Hot {hotClients} · ☀️ Warm {warmClients} · ❄️ Cold {coldClients}
        </p>
      </div>
    </div>
  );
}

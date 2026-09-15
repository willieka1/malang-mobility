import React from 'react';

export const KpiTile = ({ label, value, unit, icon: Icon, accent = '#0284C7', trend, testId }) => (
  <div
    data-testid={testId}
    className="relative bg-white border border-slate-200 rounded-xl p-5 overflow-hidden hover:border-slate-300 transition-colors"
  >
    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent }} />
    <div className="flex items-start justify-between mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 font-mono">{label}</span>
      {Icon && (
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${accent}18`, color: accent }}>
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono font-bold text-3xl text-slate-900 tabular-nums">{value}</span>
      {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
    </div>
    {trend && <div className="mt-1 text-xs text-slate-500 font-mono">{trend}</div>}
  </div>
);

export default KpiTile;

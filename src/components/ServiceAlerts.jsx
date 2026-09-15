import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, AlertOctagon, Bell, ChevronRight, Wrench, Gauge } from 'lucide-react';
import ModeChip from './ModeChip';
import { fetchServiceAlerts } from '../lib/api';

const SEVERITY = {
  critical: { label: 'Kritis', bg: '#FEE2E2', text: '#7F1D1D', dot: '#DC2626', icon: AlertOctagon },
  high: { label: 'Tinggi', bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444', icon: AlertTriangle },
  medium: { label: 'Sedang', bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', icon: Bell },
  low: { label: 'Rendah', bg: '#E0F2FE', text: '#075985', dot: '#0284C7', icon: Wrench },
};

export default function ServiceAlerts() {
  const [data, setData] = useState(null);
  const [sevFilter, setSevFilter] = useState('all');

  useEffect(() => {
    fetchServiceAlerts().then(setData);
    const int = setInterval(() => fetchServiceAlerts().then(setData), 10000);
    return () => clearInterval(int);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (sevFilter === 'all') return data.alerts;
    return data.alerts.filter(a => a.severity === sevFilter);
  }, [data, sevFilter]);

  if (!data) return <div className="p-6 text-center text-slate-500 text-sm">Memuat alert servis…</div>;

  return (
    <div data-testid="service-alerts-panel" className="space-y-4">
      {/* Severity summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(SEVERITY).map(([k, s]) => {
          const count = data.by_severity[k];
          const SevIcon = s.icon;
          const active = sevFilter === k;
          return (
            <button
              key={k}
              data-testid={`alert-severity-${k}`}
              onClick={() => setSevFilter(active ? 'all' : k)}
              className={`text-left bg-white border-2 rounded-xl p-4 transition-all ${
                active ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.text }}>
                  <SevIcon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
              </div>
              <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums leading-none">{count}</div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-slate-500 mt-1">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Alerts list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900">Alert Servis Aktif</h3>
            <div className="text-xs text-slate-500">
              {filtered.length} armada melewati atau mendekati ambang km servis
              {sevFilter !== 'all' && <span> · filter: {SEVERITY[sevFilter].label}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-700">AUTO-REFRESH 10s</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">Tidak ada alert dengan filter ini.</div>
          )}
          {filtered.map(a => {
            const s = SEVERITY[a.severity];
            const SevIcon = s.icon;
            const pct = Math.min(100, (a.km_since_service / a.km_threshold) * 100);
            return (
              <div key={a.vehicle_id} data-testid={`service-alert-${a.vehicle_id}`} className="p-4 hover:bg-slate-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                  <SevIcon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-sm text-slate-900 tabular-nums">{a.vehicle_id}</span>
                    <ModeChip mode={a.mode} code={a.route_code} size="sm" />
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      {a.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">{a.route_name}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 max-w-[280px]">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-0.5">
                        <span>Km sejak servis</span>
                        <span className="tabular-nums font-semibold text-slate-800">
                          {a.km_since_service.toLocaleString('id-ID')} / {a.km_threshold.toLocaleString('id-ID')} km
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.dot }} />
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Total {(a.mileage_total / 1000).toFixed(0)}k km
                    </div>
                    {a.km_overshoot > 0 && (
                      <div className="text-[10px] font-mono font-bold text-red-700">
                        Lewat {a.km_overshoot.toLocaleString('id-ID')} km
                      </div>
                    )}
                  </div>
                </div>
                <button
                  data-testid={`schedule-service-${a.vehicle_id}`}
                  className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 flex items-center gap-1"
                >
                  Jadwalkan <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

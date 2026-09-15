import React, { useEffect, useState } from 'react';
import { Calendar, Check, X, Clock, Sparkles, Leaf, DollarSign, Circle } from 'lucide-react';
import ModeChip from './ModeChip';
import { fetchRenewalPlan, approveRenewal } from '../lib/api';

const PRIORITY = {
  Tinggi: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  Sedang: { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  Normal: { bg: '#E0F2FE', text: '#075985', dot: '#0284C7' },
};

const APPROVAL = {
  disetujui: { bg: '#DCFCE7', text: '#15803D', label: 'Disetujui' },
  ditolak: { bg: '#FEE2E2', text: '#B91C1C', label: 'Ditolak' },
  menunggu: { bg: '#F1F5F9', text: '#475569', label: 'Menunggu' },
};

const fmtRp = (n) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

export default function RenewalPlan() {
  const [plan, setPlan] = useState(null);
  const [activeQ, setActiveQ] = useState('Q1 2026');
  const [busy, setBusy] = useState(null);

  const load = () => fetchRenewalPlan().then(setPlan);
  useEffect(() => { load(); }, []);

  const decide = async (unit_id, status) => {
    setBusy(unit_id);
    try {
      await approveRenewal(unit_id, status);
      await load();
    } finally { setBusy(null); }
  };

  if (!plan) return <div className="p-6 text-center text-slate-500 text-sm">Memuat rencana peremajaan…</div>;

  const activeQuarter = plan.quarters.find(q => q.quarter === activeQ);

  return (
    <div data-testid="renewal-plan-panel" className="space-y-4">
      {/* Program Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-slate-500 mb-1">Program 2026</div>
            <h3 className="font-display font-extrabold text-xl text-slate-900">Jadwal Peremajaan Kuartalan</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Rencana peremajaan {plan.total_units} unit dibagi ke 4 kuartal, dengan persetujuan per unit oleh operator.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Progres Persetujuan</div>
            <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">
              {plan.total_approved}/{plan.total_units}
            </div>
            <div className="text-xs text-slate-500 font-mono">{plan.approval_progress_pct}% disetujui</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={DollarSign} label="Total Anggaran" value={fmtRp(plan.total_budget)} accent="#0F172A" testId="renewal-total-budget" />
          <StatBox icon={Leaf} label="Reduksi CO₂/thn" value={`${(plan.total_co2_reduction / 1000).toFixed(1)} ton`} accent="#059669" testId="renewal-co2" />
          <StatBox icon={Sparkles} label="Setelah Program" value={`${plan.total_units - plan.total_approved} pending`} accent="#EF4444" testId="renewal-pending" />
        </div>
      </div>

      {/* Quarter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 border-b border-slate-200">
          {plan.quarters.map(q => {
            const active = q.quarter === activeQ;
            const approvedPct = q.target_units > 0 ? (q.approved / q.target_units) * 100 : 0;
            return (
              <button
                key={q.quarter}
                data-testid={`quarter-tab-${q.quarter.replace(' ', '-')}`}
                onClick={() => setActiveQ(q.quarter)}
                className={`px-4 py-3 text-left border-r border-slate-200 last:border-r-0 transition-colors ${
                  active ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className={`w-3 h-3 ${active ? 'text-white' : 'text-slate-500'}`} />
                  <span className={`text-[10px] uppercase tracking-widest font-mono font-bold ${active ? 'text-white/80' : 'text-slate-500'}`}>
                    {q.quarter}
                  </span>
                </div>
                <div className={`font-display font-extrabold text-lg leading-none ${active ? 'text-white' : 'text-slate-900'}`}>
                  {q.target_units} unit
                </div>
                <div className={`text-[10px] mt-1 font-mono ${active ? 'text-white/70' : 'text-slate-500'}`}>
                  {fmtRp(q.budget_estimate)}
                </div>
                <div className={`mt-1.5 h-1 rounded-full overflow-hidden ${active ? 'bg-white/25' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${approvedPct}%`, backgroundColor: active ? 'white' : '#22C55E' }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Unit list for active quarter */}
        <div className="p-4">
          {activeQuarter && activeQuarter.units.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">Tidak ada unit terjadwal di kuartal ini.</div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {activeQuarter?.units.map(u => {
                const prio = PRIORITY[u.priority];
                const appr = APPROVAL[u.approval_status];
                return (
                  <div
                    key={u.unit_id}
                    data-testid={`renewal-unit-${u.unit_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-400 bg-white"
                  >
                    <div className="flex-shrink-0">
                      <ModeChip mode={u.mode} code={u.route_code} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-sm tabular-nums">{u.unit_id}</span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                          style={{ backgroundColor: prio.bg, color: prio.text }}
                        >
                          <Circle className="w-2 h-2 fill-current" /> {u.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate">{u.jenis} · {u.route_name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {u.year} · {u.age} thn · {fmtRp(u.estimated_cost)} · -{u.co2_reduction_kg_year} kg CO₂/thn
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: appr.bg, color: appr.text }}
                      >
                        {appr.label}
                      </span>
                      <button
                        data-testid={`approve-${u.unit_id}`}
                        disabled={busy === u.unit_id || u.approval_status === 'disetujui'}
                        onClick={() => decide(u.unit_id, 'disetujui')}
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                        title="Setujui"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`reject-${u.unit_id}`}
                        disabled={busy === u.unit_id || u.approval_status === 'ditolak'}
                        onClick={() => decide(u.unit_id, 'ditolak')}
                        className="p-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
                        title="Tolak"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ icon: Icon, label, value, accent, testId }) => (
  <div data-testid={testId} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-1.5">
      <Icon className="w-3 h-3" style={{ color: accent }} /> {label}
    </div>
    <div className="font-mono font-extrabold text-lg text-slate-900 tabular-nums" style={{ color: accent }}>
      {value}
    </div>
  </div>
);

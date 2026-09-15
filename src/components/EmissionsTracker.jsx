import React, { useEffect, useState } from 'react';
import { Leaf, TreePine, TrendingDown, Factory } from 'lucide-react';
import ModeChip from './ModeChip';
import { fetchEmissions } from '../lib/api';

export default function EmissionsTracker() {
  const [data, setData] = useState(null);

  useEffect(() => { fetchEmissions().then(setData); }, []);

  if (!data) return <div className="p-6 text-center text-slate-500 text-sm">Memuat data emisi…</div>;

  const brackets = Object.entries(data.by_age_bracket);
  const maxBracket = Math.max(...brackets.map(([, v]) => v), 1);

  return (
    <div data-testid="emissions-panel" className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <EmStat testId="em-total" icon={Factory} label="Total Emisi CO₂/thn" value={`${data.total_co2_tons_year}`} unit="ton" accent="#0F172A" />
        <EmStat testId="em-avg" icon={Leaf} label="Rata-rata / Unit" value={data.avg_per_unit_kg.toLocaleString('id-ID')} unit="kg/thn" accent="#059669" />
        <EmStat testId="em-saving" icon={TrendingDown} label="Potensi Reduksi" value={`${(data.peremajaan_saving_kg_year / 1000).toFixed(1)}`} unit="ton/thn" accent="#EF4444" trend="jika armada peremajaan diganti" />
        <EmStat testId="em-trees" icon={TreePine} label="Setara" value={data.trees_equivalent.toLocaleString('id-ID')} unit="pohon" accent="#059669" trend="menyerap CO₂ per tahun" />
      </div>

      {/* By age bracket */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900">Emisi CO₂ per Kelompok Usia</h3>
            <p className="text-xs text-slate-500 mt-0.5">Armada tua menghasilkan emisi jauh lebih tinggi</p>
          </div>
          <Leaf className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="space-y-3">
          {brackets.map(([label, kg]) => {
            const pct = (kg / maxBracket) * 100;
            const isOld = label.includes('15') || label.includes('10-');
            return (
              <div key={label} data-testid={`em-bracket-${label.replace(/\s|<|≥/g, '')}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800">{label}</span>
                  <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                    {(kg / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-normal">ton CO₂/thn</span>
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: isOld ? '#EF4444' : '#22C55E' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top offenders */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h3 className="font-display font-bold text-slate-900">15 Armada Emisi Tertinggi</h3>
          <p className="text-xs text-slate-500">Kandidat prioritas untuk peremajaan berbasis dampak emisi</p>
        </div>
        <div className="divide-y divide-slate-100">
          {data.top_offenders.map((v, i) => (
            <div key={v.id} data-testid={`em-offender-${v.id}`} className="p-3 flex items-center gap-3 hover:bg-slate-50">
              <div className="w-6 text-center font-mono font-bold text-slate-400 tabular-nums flex-shrink-0">#{i + 1}</div>
              <ModeChip mode={v.mode} code={v.route_code} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">{v.id}</span>
                  <span className="text-[10px] font-mono text-slate-500">{v.jenis} · {v.year} ({v.age} thn)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (v.co2_kg_per_year / 12000) * 100)}%` }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono font-extrabold text-red-700 text-sm tabular-nums">
                  {v.co2_kg_per_year.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] font-mono text-slate-500">kg CO₂/thn</div>
                {v.excess_kg > 0 && (
                  <div className="text-[10px] font-mono text-red-600 font-semibold mt-0.5">
                    +{v.excess_kg.toLocaleString('id-ID')} vs. baseline
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EmStat = ({ icon: Icon, label, value, unit, accent, trend, testId }) => (
  <div data-testid={testId} className="relative bg-white border border-slate-200 rounded-xl p-4 overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accent }} />
    <div className="flex items-start justify-between mb-2">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">{label}</div>
      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${accent}15`, color: accent }}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">{value}</span>
      <span className="text-xs font-medium text-slate-500">{unit}</span>
    </div>
    {trend && <div className="text-[10px] text-slate-500 font-mono mt-1">{trend}</div>}
  </div>
);

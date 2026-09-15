import React, { useEffect, useState, useMemo } from 'react';
import {
  Wrench, CheckCircle2, AlertTriangle, RotateCw, Search, Filter,
  TrendingUp, Sparkles, Bus, TramFront, Train, Calendar, Bell, Leaf, FileDown
} from 'lucide-react';
import Layout from '../components/Layout';
import KpiTile from '../components/KpiTile';
import ModeChip from '../components/ModeChip';
import RenewalPlan from '../components/RenewalPlan';
import ServiceAlerts from '../components/ServiceAlerts';
import EmissionsTracker from '../components/EmissionsTracker';
import { fetchFleetVehicles, fetchFleetHealth } from '../lib/api';
import { MODES } from '../lib/modes';

const KONDISI = {
  'Baik': { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E', icon: CheckCircle2 },
  'Perlu Perawatan': { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', icon: Wrench },
  'Perlu Peremajaan': { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444', icon: RotateCw },
};

const STATUS_ARMADA = {
  'Aktif': { bg: '#E0F2FE', text: '#075985', dot: '#0284C7' },
  'Perlu Evaluasi': { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
};

const KONDISI_FILTERS = [
  { key: 'all', label: 'Semua Kondisi' },
  { key: 'Baik', label: 'Baik' },
  { key: 'Perlu Perawatan', label: 'Perlu Perawatan' },
  { key: 'Perlu Peremajaan', label: 'Perlu Peremajaan' },
];

const MODE_FILTERS = [
  { key: 'all', label: 'Semua', icon: Filter },
  { key: 'angkot', label: 'Angkot', icon: TramFront },
  { key: 'trans_jatim', label: 'Trans Jatim', icon: Bus },
  { key: 'kereta', label: 'Kereta', icon: Train },
  { key: 'bus', label: 'Bus', icon: Bus },
];

export default function Armada() {
  const [vehicles, setVehicles] = useState([]);
  const [health, setHealth] = useState(null);
  const [kondisiFilter, setKondisiFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('kondisi');
  const perPage = 15;

  useEffect(() => {
    fetchFleetVehicles().then(setVehicles);
    fetchFleetHealth().then(setHealth);
  }, []);

  const filtered = useMemo(() => {
    let list = vehicles;
    if (kondisiFilter !== 'all') list = list.filter(v => v.kondisi === kondisiFilter);
    if (modeFilter !== 'all') list = list.filter(v => v.mode === modeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.route_code.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        String(v.year).includes(q)
      );
    }
    return list;
  }, [vehicles, kondisiFilter, modeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [kondisiFilter, modeFilter, search]);

  const pctBaik = health && health.total_armada > 0 ? (health.kondisi_baik / health.total_armada) * 100 : 0;
  const pctPerawatan = health && health.total_armada > 0 ? (health.perlu_perawatan / health.total_armada) * 100 : 0;
  const pctPeremajaan = health && health.total_armada > 0 ? (health.perlu_peremajaan / health.total_armada) * 100 : 0;

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Manajemen Armada</div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">Kondisi & Peremajaan Armada</h1>
            <p className="text-slate-600 text-sm mt-1">
              Rangkuman kondisi armada transportasi Malang dan indikator kebutuhan peremajaan.
              {health && (
                <span className="ml-2 font-mono text-xs text-slate-500">
                  Rata-rata usia armada: <strong className="text-slate-900">{health.avg_age_years} tahun</strong>
                </span>
              )}
            </p>
          </div>
          {health && health.perlu_peremajaan > 0 && (
            <div data-testid="renewal-callout" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
              <Sparkles className="w-4 h-4 text-red-600" />
              <div className="text-xs">
                <div className="font-mono font-bold text-red-800 uppercase tracking-wider">Peremajaan</div>
                <div className="text-red-700">
                  <strong>{health.perlu_peremajaan}</strong> unit perlu diremajakan
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1">
            {[
              { k: 'kondisi', label: 'Kondisi Armada', icon: Wrench },
              { k: 'peremajaan', label: 'Jadwal Peremajaan', icon: Calendar },
              { k: 'alert', label: 'Alert Servis', icon: Bell },
              { k: 'emisi', label: 'Emisi CO₂', icon: Leaf },
            ].map(t => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.k}
                  data-testid={`tab-${t.k}`}
                  onClick={() => setTab(t.k)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    tab === t.k ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <button
            data-testid="export-pdf-btn"
            type="button"
            onClick={() => {
              const rows = [
                ['ID Armada', 'Jenis', 'Rute', 'Tahun', 'Kondisi', 'Status'],
                ...vehicles.map(v => [v.id, v.jenis, v.route_code, v.year, v.kondisi, v.status_armada]),
              ];
              const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'malang-mobility-armada.csv';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            Ekspor Data Armada
          </button>
        </div>

        {tab === 'peremajaan' && <RenewalPlan />}
        {tab === 'alert' && <ServiceAlerts />}
        {tab === 'emisi' && <EmissionsTracker />}
        {tab === 'kondisi' && (
        <>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KpiTile
            testId="armada-kpi-total"
            label="Total Armada"
            value={health?.total_armada ?? '—'}
            unit="unit"
            icon={Bus}
            accent="#0F172A"
            trend="Seluruh moda tercatat"
          />
          <KpiTile
            testId="armada-kpi-aktif"
            label="Armada Aktif"
            value={health?.armada_aktif ?? '—'}
            unit="unit"
            icon={CheckCircle2}
            accent="#059669"
            trend={health ? `${Math.round((health.armada_aktif / health.total_armada) * 100)}% dari total` : ''}
          />
          <KpiTile
            testId="armada-kpi-perawatan"
            label="Perlu Perawatan"
            value={health?.perlu_perawatan ?? '—'}
            unit="unit"
            icon={Wrench}
            accent="#D97706"
            trend="Servis rutin dibutuhkan"
          />
          <KpiTile
            testId="armada-kpi-peremajaan"
            label="Perlu Peremajaan"
            value={health?.perlu_peremajaan ?? '—'}
            unit="unit"
            icon={RotateCw}
            accent="#EF4444"
            trend="Usia ≥ 12 tahun"
          />
        </div>

        {/* Condition Visualization */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Condition bar */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-slate-900">Distribusi Kondisi Armada</h3>
                <p className="text-xs text-slate-500 mt-0.5">Proporsi kondisi seluruh armada terhubung</p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>

            {/* Segmented Bar */}
            <div data-testid="condition-bar" className="flex h-6 rounded-lg overflow-hidden border border-slate-200 mb-3">
              {pctBaik > 0 && (
                <div style={{ width: `${pctBaik}%`, backgroundColor: KONDISI['Baik'].dot }} title={`Baik ${pctBaik.toFixed(1)}%`} className="flex items-center justify-center">
                  {pctBaik > 8 && <span className="text-[10px] font-mono font-bold text-white">{pctBaik.toFixed(0)}%</span>}
                </div>
              )}
              {pctPerawatan > 0 && (
                <div style={{ width: `${pctPerawatan}%`, backgroundColor: KONDISI['Perlu Perawatan'].dot }} title={`Perlu Perawatan ${pctPerawatan.toFixed(1)}%`} className="flex items-center justify-center">
                  {pctPerawatan > 8 && <span className="text-[10px] font-mono font-bold text-white">{pctPerawatan.toFixed(0)}%</span>}
                </div>
              )}
              {pctPeremajaan > 0 && (
                <div style={{ width: `${pctPeremajaan}%`, backgroundColor: KONDISI['Perlu Peremajaan'].dot }} title={`Perlu Peremajaan ${pctPeremajaan.toFixed(1)}%`} className="flex items-center justify-center">
                  {pctPeremajaan > 8 && <span className="text-[10px] font-mono font-bold text-white">{pctPeremajaan.toFixed(0)}%</span>}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              {Object.entries(KONDISI).map(([k, v]) => {
                const count = k === 'Baik' ? health?.kondisi_baik : k === 'Perlu Perawatan' ? health?.perlu_perawatan : health?.perlu_peremajaan;
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.dot }} />
                    <span className="text-slate-700 font-medium">{k}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{count ?? '—'}</span>
                  </div>
                );
              })}
            </div>

            {/* Year distribution mini chart */}
            {health?.year_distribution && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-semibold">Distribusi Tahun Produksi</div>
                  <div className="text-[10px] font-mono text-slate-500">≤ 2014 = kandidat peremajaan</div>
                </div>
                <div className="flex items-end gap-1 h-24" data-testid="year-chart">
                  {health.year_distribution.map(({ year, count }) => {
                    const maxCount = Math.max(...health.year_distribution.map(x => x.count));
                    const h = (count / maxCount) * 100;
                    const isOld = year <= 2014;
                    return (
                      <div key={year} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full rounded-t transition-all group-hover:opacity-100"
                          style={{
                            height: `${h}%`,
                            backgroundColor: isOld ? '#EF4444' : year <= 2018 ? '#F59E0B' : '#22C55E',
                            opacity: 0.85,
                          }}
                        />
                        <div className="text-[9px] font-mono text-slate-500 tabular-nums">'{String(year).slice(2)}</div>
                        <div className="absolute -top-8 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                          {year}: {count} unit
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modernization insight card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <RotateCw className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-display font-bold text-slate-900">Peremajaan Armada</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Armada yang beroperasi lebih dari 12 tahun menurunkan kenyamanan penumpang dan meningkatkan emisi. Program peremajaan mendorong transportasi Malang lebih modern & rendah karbon.
            </p>

            {health && (
              <div className="mt-auto space-y-3">
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Target Modernisasi</span>
                    <span className="font-mono font-bold text-slate-900">
                      {health.armada_aktif - health.perlu_peremajaan}/{health.armada_aktif}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((health.armada_aktif - health.perlu_peremajaan) / health.armada_aktif) * 100}%`,
                        backgroundColor: '#059669',
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Progres armada muda (produksi ≥ 2015)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Rekomendasi</div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Prioritaskan peremajaan <strong className="text-red-700">{health.perlu_peremajaan} unit</strong> tertua di trayek angkot untuk meningkatkan kualitas layanan.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
            {MODE_FILTERS.map(f => {
              const Icon = f.icon;
              const active = modeFilter === f.key;
              return (
                <button
                  key={f.key}
                  data-testid={`armada-mode-${f.key}`}
                  onClick={() => setModeFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
            {KONDISI_FILTERS.map(f => (
              <button
                key={f.key}
                data-testid={`armada-kondisi-${f.key.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setKondisiFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  kondisiFilter === f.key ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              data-testid="armada-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID armada, plat, atau tahun..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-600 tabular-nums">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {vehicles.length} armada
          </div>
        </div>

        {/* Fleet Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <TH>ID Armada</TH>
                  <TH>Jenis</TH>
                  <TH>Rute</TH>
                  <TH>Tahun</TH>
                  <TH>Kondisi</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Plat</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                      Tidak ada armada yang cocok dengan filter.
                    </td>
                  </tr>
                )}
                {pageItems.map(v => {
                  const kondisi = KONDISI[v.kondisi] || KONDISI['Baik'];
                  const statusA = STATUS_ARMADA[v.status_armada] || STATUS_ARMADA['Aktif'];
                  const KondisiIcon = kondisi.icon;
                  const age = 2026 - v.year;
                  return (
                    <tr key={v.id} data-testid={`armada-row-${v.id}`} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">{v.id}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-semibold"
                          style={{ backgroundColor: `${v.color}18`, color: v.color }}
                        >
                          {v.jenis}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <ModeChip mode={v.mode} code={v.route_code} size="sm" />
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-mono text-xs text-slate-900 font-semibold tabular-nums">{v.year}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{age} thn</div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                          style={{ backgroundColor: kondisi.bg, color: kondisi.text }}
                        >
                          <KondisiIcon className="w-3 h-3" />
                          {v.kondisi}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ backgroundColor: statusA.bg, color: statusA.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusA.dot }} />
                          {v.status_armada}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-slate-600">{v.plate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="font-mono text-slate-600">
                Halaman <span className="font-bold text-slate-900">{page}</span> dari {totalPages}
                <span className="ml-3">· {filtered.length} baris ·  menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  data-testid="armada-prev-page"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
                >
                  ← Prev
                </button>
                <button
                  data-testid="armada-next-page"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mode breakdown */}
        {health?.by_mode && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(health.by_mode).map(([mode, data]) => {
              const m = MODES[mode];
              const pctBaikMode = (data.baik / data.total) * 100;
              return (
                <div key={mode} data-testid={`armada-mode-summary-${mode}`} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ModeChip mode={mode} code={m?.fullLabel} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500">Baik</div>
                      <div className="font-mono font-bold text-emerald-700 text-sm tabular-nums">{data.baik}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500">Perawatan</div>
                      <div className="font-mono font-bold text-amber-700 text-sm tabular-nums">{data.perawatan}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500">Peremajaan</div>
                      <div className="font-mono font-bold text-red-700 text-sm tabular-nums">{data.peremajaan}</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pctBaikMode}%`, backgroundColor: '#22C55E' }} />
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-slate-500">
                    {Math.round(pctBaikMode)}% dalam kondisi baik · Total {data.total} unit
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>
    </Layout>
  );
}

const TH = ({ children, className = '' }) => (
  <th className={`text-left px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-mono font-semibold ${className}`}>
    {children}
  </th>
);

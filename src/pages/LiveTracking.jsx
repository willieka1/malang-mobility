import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Radio, Gauge, Users, MapPin, Activity, Bus, TramFront, AlertTriangle,
  PauseCircle, Wrench, Zap, Search, ChevronRight, RefreshCw, X, Clock, Navigation
} from 'lucide-react';
import Layout from '../components/Layout';
import MalangMap from '../components/MalangMap';
import ModeChip from '../components/ModeChip';
import KpiTile from '../components/KpiTile';
import { fetchHubs, fetchLiveVehicles, fetchLiveStats } from '../lib/api';

const CROWD_COLOR = { Longgar: '#22C55E', Sedang: '#F59E0B', Penuh: '#EF4444' };

const OP_STATUS = {
  beroperasi: { label: 'Beroperasi', bg: '#DCFCE7', text: '#15803D', dot: '#22C55E', icon: Zap },
  berhenti: { label: 'Berhenti', bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444', icon: PauseCircle },
  perawatan: { label: 'Perawatan', bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', icon: Wrench },
};

const MODE_FILTERS = [
  { key: 'all', label: 'Semua', icon: Activity },
  { key: 'angkot', label: 'Angkot', icon: TramFront },
  { key: 'trans_jatim', label: 'Trans Jatim', icon: Bus },
];

// Compute seconds since ISO timestamp
const secondsAgo = (iso) => {
  if (!iso) return 0;
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  return diff;
};

const formatTimeAgo = (secs) => {
  if (secs < 60) return `${secs} detik lalu`;
  const m = Math.floor(secs / 60);
  return `${m} menit lalu`;
};

export default function LiveTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [modeFilter, setModeFilter] = useState('all');
  const [opFilter, setOpFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [lastTick, setLastTick] = useState(new Date());
  const [tickCount, setTickCount] = useState(0);
  const mapRef = useRef(null);

  const loadAll = () => {
    Promise.all([fetchLiveVehicles(), fetchLiveStats()]).then(([v, s]) => {
      setVehicles(v);
      setStats(s);
      setLastTick(new Date());
      setTickCount(c => c + 1);
    });
  };

  useEffect(() => {
    fetchHubs().then(setHubs);
    loadAll();
    const interval = setInterval(loadAll, 4000); // 4s refresh
    return () => clearInterval(interval);
  }, []);

  // Filtered vehicles
  const filtered = useMemo(() => {
    let list = vehicles;
    if (modeFilter !== 'all') list = list.filter(v => v.mode === modeFilter);
    if (opFilter !== 'all') list = list.filter(v => v.operational_status === opFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.id.toLowerCase().includes(q) ||
        v.route_code.toLowerCase().includes(q) ||
        v.route_name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vehicles, modeFilter, opFilter, search]);

  const selected = vehicles.find(v => v.id === selectedId);

  // Fly-to when selecting
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.6 });
    }
  }, [selectedId]); // eslint-disable-line

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Simulation Banner */}
        <div
          data-testid="simulation-banner"
          className="mb-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-semibold font-mono uppercase tracking-wide">Data Simulasi GPS</span>
            <span className="ml-2 opacity-80">— posisi armada disimulasikan untuk demo. Struktur endpoint siap dihubungkan ke feed GPS nyata.</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/60 border border-amber-200">v1.0</span>
        </div>

        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Command Center</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-red-700">LIVE · {tickCount}</span>
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">Live Tracking Armada</h1>
            <p className="text-slate-600 text-sm mt-1">
              Pantau posisi & kondisi armada Trans Jatim, angkot, dan kereta di jaringan Malang.
              <span className="ml-2 font-mono text-xs text-slate-500">
                Update: {lastTick.toLocaleTimeString('id-ID')} · refresh 4 detik
              </span>
            </p>
          </div>
          <button
            data-testid="manual-refresh"
            onClick={loadAll}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Manual
          </button>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KpiTile
            testId="live-kpi-aktif"
            label="Kendaraan Aktif"
            value={stats?.kendaraan_aktif ?? '—'}
            unit="unit"
            icon={Radio}
            accent="#0F172A"
            trend="Total armada dilacak"
          />
          <KpiTile
            testId="live-kpi-beroperasi"
            label="Sedang Beroperasi"
            value={stats?.beroperasi ?? '—'}
            unit="unit"
            icon={Zap}
            accent="#059669"
            trend={stats ? `Avg ${stats.avg_speed_kmh} km/j` : ''}
          />
          <KpiTile
            testId="live-kpi-berhenti"
            label="Berhenti"
            value={stats?.berhenti ?? '—'}
            unit="unit"
            icon={PauseCircle}
            accent="#EF4444"
            trend="Off-route / idle"
          />
          <KpiTile
            testId="live-kpi-perawatan"
            label="Perlu Perawatan"
            value={stats?.perlu_perawatan ?? '—'}
            unit="unit"
            icon={Wrench}
            accent="#D97706"
            trend="Terjadwal maintenance"
          />
        </div>

        {/* Filters bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
            {MODE_FILTERS.map(f => {
              const Icon = f.icon;
              const active = modeFilter === f.key;
              return (
                <button
                  key={f.key}
                  data-testid={`mode-${f.key}`}
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
            {[
              { k: 'all', l: 'Status: Semua' },
              { k: 'beroperasi', l: 'Beroperasi' },
              { k: 'berhenti', l: 'Berhenti' },
              { k: 'perawatan', l: 'Perawatan' },
            ].map(o => (
              <button
                key={o.k}
                data-testid={`op-${o.k}`}
                onClick={() => setOpFilter(o.k)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  opFilter === o.k ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              data-testid="live-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID kendaraan, trayek, atau plat..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-600 tabular-nums">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {vehicles.length} armada
          </div>
        </div>

        {/* Main: map + list */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Map */}
          <div className="lg:col-span-3 relative">
            <MalangMap
              hubs={hubs}
              vehicles={filtered}
              routes={[]}
              height="620px"
              onVehicleClick={(v) => setSelectedId(v.id)}
              mapRef={mapRef}
              testId="live-tracking-map"
            />
            <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-2 shadow-md">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700">Streaming · every 4s</span>
              </div>
            </div>
          </div>

          {/* Vehicle List / Detail */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" style={{ height: 620 }}>
            {selected ? (
              <VehicleDetail
                v={selected}
                onClose={() => setSelectedId(null)}
                onFocus={() => {
                  if (mapRef.current) mapRef.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 });
                }}
              />
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-sm">Armada Terpantau</h3>
                    <div className="text-[11px] text-slate-500 font-mono">Klik untuk melihat detail</div>
                  </div>
                  <Radio className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">Tidak ada armada yang cocok dengan filter.</div>
                  )}
                  {filtered.slice(0, 80).map(v => (
                    <VehicleRow
                      key={v.id}
                      v={v}
                      onClick={() => setSelectedId(v.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity ticker */}
        <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-700" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Aktivitas Terbaru</h3>
            <span className="text-[10px] font-mono text-slate-500 ml-1">simulasi</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {vehicles.slice(0, 6).map((v, i) => (
              <ActivityRow key={v.id} v={v} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ============== Sub-components ==============
const VehicleRow = ({ v, onClick }) => {
  const op = OP_STATUS[v.operational_status] || OP_STATUS.beroperasi;
  const OpIcon = op.icon;
  return (
    <button
      data-testid={`vehicle-row-${v.id}`}
      onClick={onClick}
      className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${v.color}20`, color: v.color }}>
        <ModeChip mode={v.mode} code={v.route_code} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">{v.id}</span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
            style={{ backgroundColor: op.bg, color: op.text }}
          >
            <OpIcon className="w-2.5 h-2.5" />
            {op.label}
          </span>
        </div>
        <div className="text-[11px] text-slate-600 truncate">{v.route_name}</div>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-slate-500">
          <span><Gauge className="w-2.5 h-2.5 inline mr-0.5" />{v.speed_kmh} km/j</span>
          <span><MapPin className="w-2.5 h-2.5 inline mr-0.5" />ETA {v.next_stop_eta_min}m</span>
          <span>{formatTimeAgo(secondsAgo(v.last_update_iso))}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </button>
  );
};

const VehicleDetail = ({ v, onClose, onFocus }) => {
  const op = OP_STATUS[v.operational_status] || OP_STATUS.beroperasi;
  const OpIcon = op.icon;
  return (
    <div data-testid={`live-detail-${v.id}`} className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200" style={{ background: `linear-gradient(180deg, ${v.color}12 0%, transparent 100%)` }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: v.color }}>
              {v.mode === 'angkot' ? 'Angkutan Kota' : v.mode === 'trans_jatim' ? 'Trans Jatim BRT' : v.mode === 'kereta' ? 'Kereta Api' : 'Bus Antarkota'}
            </div>
            <div className="font-display font-extrabold text-2xl text-slate-900 leading-none mt-1 tabular-nums">
              {v.id}
            </div>
            <div className="text-sm text-slate-700 mt-1 font-medium">{v.route_code} · {v.route_name}</div>
          </div>
          <button
            data-testid="live-close-detail"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: op.bg, color: op.text }}
        >
          <OpIcon className="w-3 h-3" />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: op.dot }} />
          {op.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Live metrics */}
        <div>
          <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-2">Telemetri Real-Time</div>
          <div className="grid grid-cols-2 gap-2">
            <Metric icon={Gauge} label="Kecepatan" value={v.speed_kmh} unit="km/j" />
            <Metric icon={Clock} label="ETA" value={v.next_stop_eta_min} unit="min" />
            <Metric icon={Users} label="Kepadatan" value={v.crowd} accent={CROWD_COLOR[v.crowd]} />
            <Metric icon={Navigation} label="Arah" value={`${v.heading}°`} />
          </div>
        </div>

        {/* Next stop */}
        <div className="rounded-lg p-3 border border-slate-200 bg-slate-50">
          <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-1">Halte Selanjutnya</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-700" />
            <div>
              <div className="font-display font-bold text-slate-900 text-sm leading-tight">{v.next_stop}</div>
              <div className="text-[11px] text-slate-600 font-mono">Tiba dalam {v.next_stop_eta_min} menit</div>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div>
          <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-2">Informasi Kendaraan</div>
          <div className="space-y-1.5 text-xs">
            <InfoRow label="Nomor Plat" value={v.plate} mono />
            <InfoRow label="Operator" value={v.driver} />
            <InfoRow label="BBM" value={`${v.fuel_pct}%`} mono />
            <InfoRow label="Servis Terakhir" value={v.last_maintenance} mono />
            <InfoRow label="Posisi GPS" value={`${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}`} mono />
          </div>
        </div>

        {/* Update timestamp */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500 uppercase tracking-widest">Update Terakhir</span>
          <span className="text-slate-800 font-semibold">{formatTimeAgo(secondsAgo(v.last_update_iso))}</span>
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
        <button
          data-testid="live-focus-btn"
          onClick={onFocus}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Fokus di Peta
        </button>
        <button className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100">
          Kontak Sopir
        </button>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value, unit, accent }) => (
  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-1">
      <Icon className="w-2.5 h-2.5" style={accent ? { color: accent } : {}} /> {label}
    </div>
    <div className="font-mono font-bold text-slate-900 text-base tabular-nums" style={accent ? { color: accent } : {}}>
      {value}{unit && <span className="text-[10px] font-medium opacity-60 ml-0.5">{unit}</span>}
    </div>
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className={`text-slate-900 ${mono ? 'font-mono font-semibold' : 'font-medium'}`}>{value}</span>
  </div>
);

const ActivityRow = ({ v, idx }) => {
  const op = OP_STATUS[v.operational_status] || OP_STATUS.beroperasi;
  const messages = [
    `Melewati ${v.next_stop}`,
    `Naik ${idx + 2} penumpang`,
    `Update posisi GPS`,
    `Kecepatan ${v.speed_kmh} km/j`,
    `Menuju halte berikutnya`,
    `Sinyal GPS OK`,
  ];
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: op.dot }} />
      <span className="font-mono font-bold text-[10px] text-slate-800 tabular-nums flex-shrink-0">{v.id}</span>
      <span className="text-[11px] text-slate-600 flex-1 truncate">{messages[idx % messages.length]}</span>
      <span className="text-[9px] font-mono text-slate-400">{formatTimeAgo(secondsAgo(v.last_update_iso))}</span>
    </div>
  );
};

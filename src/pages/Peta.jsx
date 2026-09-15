import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus, Train, TramFront, Building2, Radio, MapPin, X, Layers, Gauge,
  Users, Clock, Route as RouteIcon, Circle, Square
} from 'lucide-react';
import Layout from '../components/Layout';
import MalangMap from '../components/MalangMap';
import { fetchHubs, fetchRoutes, fetchLiveVehicles } from '../lib/api';
import { MODES } from '../lib/modes';

// Filter categories (aggregate view)
const FILTERS = [
  { key: 'semua', label: 'Semua', icon: Layers, color: '#0F172A' },
  { key: 'angkot', label: 'Angkot', icon: TramFront, color: '#D97706', modeMatch: ['angkot'] },
  { key: 'trans_jatim', label: 'Trans Jatim', icon: Bus, color: '#0284C7', modeMatch: ['trans_jatim'] },
  { key: 'stasiun', label: 'Stasiun', icon: Train, color: '#1E3A8A', hubMatch: 'railway' },
  { key: 'terminal', label: 'Terminal', icon: Building2, color: '#059669', hubMatch: 'terminal' },
];

const STATUS_META = {
  tepat_waktu: { label: 'Tepat Waktu', bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  padat: { label: 'Padat', bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  terlambat: { label: 'Terlambat', bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  perawatan: { label: 'Perawatan', bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
};

export default function Peta() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [hubs, setHubs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [lastTick, setLastTick] = useState(new Date());

  useEffect(() => {
    fetchHubs().then(setHubs);
    fetchRoutes().then(setRoutes);
    const load = () => fetchLiveVehicles().then(v => {
      setVehicles(v);
      setLastTick(new Date());
    });
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    const f = FILTERS.find(x => x.key === activeFilter);
    if (activeFilter === 'semua') {
      return { hubs, routes, vehicles };
    }
    if (f.hubMatch) {
      return { hubs: hubs.filter(h => h.type === f.hubMatch), routes: [], vehicles: [] };
    }
    if (f.modeMatch) {
      return {
        hubs: [],
        routes: routes.filter(r => f.modeMatch.includes(r.mode)),
        vehicles: vehicles.filter(v => f.modeMatch.includes(v.mode)),
      };
    }
    return { hubs, routes, vehicles };
  }, [activeFilter, hubs, routes, vehicles]);

  // Update selected vehicle from live cache
  useEffect(() => {
    if (selectedVehicle) {
      const updated = vehicles.find(v => v.id === selectedVehicle.id);
      if (updated) setSelectedVehicle(updated);
    }
  }, [vehicles]); // eslint-disable-line

  const counts = {
    angkot: vehicles.filter(v => v.mode === 'angkot').length,
    trans_jatim: vehicles.filter(v => v.mode === 'trans_jatim').length,
    stasiun: hubs.filter(h => h.type === 'railway').length,
    terminal: hubs.filter(h => h.type === 'terminal').length,
  };

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Peta Jaringan</div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Peta Transportasi Kota Malang
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
              </span>
              <span>LIVE</span>
            </div>
            <span>·</span>
            <span>Update {lastTick.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* Map-focused container */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white" style={{ height: '78vh', minHeight: '600px' }}>
          <MalangMap
            hubs={filtered.hubs}
            routes={filtered.routes}
            vehicles={filtered.vehicles}
            activeRouteCodes={filtered.routes.map(r => r.code)}
            height="100%"
            onVehicleClick={setSelectedVehicle}
            mapRef={mapRef}
            testId="peta-map"
          />

          {/* Floating Filter Bar */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto z-[400] flex flex-wrap gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-1.5 shadow-lg">
            {FILTERS.map(f => {
              const Icon = f.icon;
              const active = activeFilter === f.key;
              const count = counts[f.key];
              return (
                <button
                  key={f.key}
                  data-testid={`filter-${f.key}`}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  style={active ? { backgroundColor: f.color } : {}}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {f.label}
                  {count !== undefined && count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend (bottom-left) */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg max-w-[240px] hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold mb-2">Legenda</div>
            <div className="space-y-1.5">
              <LegendItem shape="circle" color="#D97706" label="Angkot (bulat)" />
              <LegendItem shape="rounded" color="#0284C7" label="Trans Jatim (kotak)" />
              <LegendItem shape="diamond" color="#1E3A8A" label="Kereta (belah ketupat)" />
              <LegendItem shape="hub-emerald" color="#059669" label="Terminal Bus" hub />
              <LegendItem shape="hub-indigo" color="#1E3A8A" label="Stasiun Kereta" hub />
            </div>
          </div>

          {/* Live stats badge (bottom-right) */}
          <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold mb-2">Ditampilkan</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
              <div className="flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {filtered.vehicles.filter(v => v.mode === 'angkot').length} angkot</div>
              <div className="flex items-center gap-1"><Square className="w-2.5 h-2.5 fill-sky-500 text-sky-500" /> {filtered.vehicles.filter(v => v.mode === 'trans_jatim').length} BRT</div>
              <div className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5 text-emerald-600" /> {filtered.hubs.filter(h => h.type === 'terminal').length} terminal</div>
              <div className="flex items-center gap-1"><Train className="w-2.5 h-2.5 text-indigo-800" /> {filtered.hubs.filter(h => h.type === 'railway').length} stasiun</div>
            </div>
          </div>

          {/* Vehicle Detail Slide-in Panel */}
          {selectedVehicle && (
            <div
              data-testid="vehicle-detail-panel"
              className="absolute top-20 right-4 z-[450] w-[320px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
            >
              <div className="p-4 border-b border-slate-100" style={{ background: `linear-gradient(180deg, ${selectedVehicle.color}12 0%, transparent 100%)` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: selectedVehicle.color }}>
                      {selectedVehicle.mode === 'angkot' ? 'Angkot' :
                       selectedVehicle.mode === 'trans_jatim' ? 'Trans Jatim' :
                       selectedVehicle.mode === 'kereta' ? 'Kereta' : 'Bus'}
                    </div>
                    <div className="font-display font-extrabold text-lg text-slate-900 leading-tight mt-0.5">
                      {selectedVehicle.route_code}
                    </div>
                  </div>
                  <button
                    data-testid="close-vehicle-panel"
                    onClick={() => setSelectedVehicle(null)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-700 leading-snug">{selectedVehicle.route_name}</div>
              </div>

              <div className="p-4 space-y-3">
                <DetailRow label="Vehicle ID" value={selectedVehicle.id} mono />
                <DetailRow label="Nomor Plat" value={selectedVehicle.plate} mono />
                <DetailRow label="Operator" value={selectedVehicle.driver} />

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-2">Status Real-Time</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: STATUS_META[selectedVehicle.status]?.bg,
                        color: STATUS_META[selectedVehicle.status]?.text,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: STATUS_META[selectedVehicle.status]?.dot }} />
                      {STATUS_META[selectedVehicle.status]?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Metric icon={Gauge} label="Kecepatan" value={selectedVehicle.speed_kmh} unit="km/j" />
                    <Metric icon={Clock} label="ETA Halte" value={selectedVehicle.next_stop_eta_min} unit="min" />
                    <Metric icon={Users} label="Kepadatan" value={selectedVehicle.crowd} />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 uppercase tracking-widest">Update Terakhir</span>
                  <span className="text-slate-700">{lastTick.toLocaleTimeString('id-ID')}</span>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    data-testid="focus-on-map-btn"
                    onClick={() => {
                      if (mapRef.current && selectedVehicle) {
                        mapRef.current.flyTo([selectedVehicle.lat, selectedVehicle.lng], 16, { duration: 0.8 });
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Fokus di Peta
                  </button>
                  <button
                    data-testid="view-route-btn"
                    onClick={() => {
                      navigate(`/cari-rute?from=Halte%20Terdekat&to=${encodeURIComponent(selectedVehicle.route_name.split(' - ').pop() || 'Tujuan')}`);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200"
                  >
                    Lihat Trayek
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode inventory below map */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryTile icon={TramFront} label="Trayek Angkot" value={routes.filter(r => r.mode === 'angkot').length} accent="#D97706" testId="summary-angkot" />
          <SummaryTile icon={Bus} label="Trans Jatim" value={routes.filter(r => r.mode === 'trans_jatim').length} accent="#0284C7" testId="summary-trans-jatim" />
          <SummaryTile icon={Train} label="Stasiun Aktif" value={hubs.filter(h => h.type === 'railway').length} accent="#1E3A8A" testId="summary-stasiun" />
          <SummaryTile icon={Building2} label="Terminal" value={hubs.filter(h => h.type === 'terminal').length} accent="#059669" testId="summary-terminal" />
        </div>
      </div>
    </Layout>
  );
}

// ---- Helpers ----
const DetailRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">{label}</span>
    <span className={`text-xs text-slate-900 ${mono ? 'font-mono font-semibold' : 'font-medium'}`}>{value}</span>
  </div>
);

const Metric = ({ icon: Icon, label, value, unit }) => (
  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-mono text-slate-500 mb-1">
      <Icon className="w-2.5 h-2.5" /> {label}
    </div>
    <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
      {value}{unit && <span className="text-[10px] font-medium text-slate-500 ml-0.5">{unit}</span>}
    </div>
  </div>
);

const LegendItem = ({ shape, color, label, hub }) => (
  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-700">
    {hub ? (
      <div style={{
        width: 14, height: 14, background: color, borderRadius: 4,
        border: '2px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }} />
    ) : (
      <div style={{
        width: 14, height: 14, background: color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'diamond' ? 3 : 4,
        transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
        border: '2px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }} />
    )}
    <span>{label}</span>
  </div>
);

const SummaryTile = ({ icon: Icon, label, value, accent, testId }) => (
  <div data-testid={testId} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}18`, color: accent }}>
      <Icon className="w-5 h-5" strokeWidth={2.5} />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">{label}</div>
      <div className="font-mono font-extrabold text-xl text-slate-900 tabular-nums">{value}</div>
    </div>
  </div>
);

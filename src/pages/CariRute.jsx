import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock, Coins, ArrowRight, Repeat, Leaf, Footprints, MapPin, Circle,
  ArrowUpDown, Search, Zap, ChevronRight, Bus, Train, TramFront, Info,
  Bookmark, Share2, Navigation, Timer
} from 'lucide-react';
import Layout from '../components/Layout';
import ModeChip from '../components/ModeChip';
import MalangMap from '../components/MalangMap';
import { searchRoutes, fetchHubs, fetchRoutes } from '../lib/api';
import { getMode } from '../lib/modes';

const QUICK_ORIGINS = ['Stasiun Malang', 'Terminal Arjosari', 'Alun-Alun Malang', 'Kampus UB'];
const QUICK_DEST = ['Terminal Landungsari', 'Universitas Brawijaya', 'Malang Town Square', 'Terminal Gadang'];

const MODE_ICON = { angkot: TramFront, trans_jatim: Bus, kereta: Train, bus: Bus, walk: Footprints };

// -------- Route Option Card --------
const RouteOptionCard = ({ opt, active, onClick, index }) => {
  const modes = [...new Set(opt.legs.filter(l => l.mode !== 'walk').map(l => l.mode))];
  return (
    <button
      data-testid={`route-option-${index}`}
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl transition-all border-2 ${
        active ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              index === 0 ? 'bg-emerald-100 text-emerald-800' :
              index === 1 ? 'bg-amber-100 text-amber-800' :
              index === 2 ? 'bg-sky-100 text-sky-800' :
              'bg-violet-100 text-violet-800'
            }`}>
              {opt.label || `Opsi ${index + 1}`}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{opt.departure_time} → {opt.arrival_time}</span>
          </div>
          <div className="text-right">
            <div className="font-mono font-extrabold text-slate-900 text-lg leading-none tabular-nums">
              {opt.total_duration_min}
              <span className="text-xs font-semibold text-slate-500 ml-1">min</span>
            </div>
          </div>
        </div>

        {/* Mode strip */}
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {opt.legs.map((leg, i) => {
            const Icon = MODE_ICON[leg.mode] || Bus;
            const m = getMode(leg.mode);
            return (
              <React.Fragment key={i}>
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold"
                  style={{
                    backgroundColor: leg.mode === 'walk' ? '#F1F5F9' : m.bg,
                    color: leg.mode === 'walk' ? '#475569' : m.text,
                  }}
                >
                  <Icon className="w-3 h-3" strokeWidth={2.5} />
                  {leg.mode === 'walk' ? `${leg.duration_min}m` : leg.route_code}
                </div>
                {i < opt.legs.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
          <Stat icon={Coins} value={`Rp ${(opt.total_fare / 1000).toFixed(0)}K`} label="Tarif" />
          <Stat icon={Repeat} value={opt.transfers} label="Transfer" />
          <Stat icon={Footprints} value={`${opt.walking_min}m`} label={`${opt.walking_m}m jalan`} />
          <Stat icon={Leaf} value={`-${opt.co2_saved_kg}`} label="kg CO₂" tint="emerald" />
        </div>
      </div>
    </button>
  );
};

const Stat = ({ icon: Icon, value, label, tint }) => (
  <div className="text-center">
    <div className={`flex items-center justify-center gap-1 font-mono font-bold text-xs ${tint === 'emerald' ? 'text-emerald-700' : 'text-slate-900'}`}>
      <Icon className="w-3 h-3 opacity-60" /> {value}
    </div>
    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">{label}</div>
  </div>
);

// -------- Journey Timeline (detailed view) --------
const JourneyTimeline = ({ opt, origin, destination }) => {
  return (
    <div data-testid="journey-timeline">
      {/* Origin */}
      <TimelineNode
        color="#0F172A"
        icon={<Navigation className="w-3.5 h-3.5 text-white" />}
        title={origin}
        subtitle={`Berangkat · ${opt.departure_time}`}
        big
      />

      {opt.legs.map((leg, i) => (
        <React.Fragment key={i}>
          <TimelineLeg leg={leg} />
          {i < opt.legs.length - 1 && (
            <TimelineTransfer nextLeg={opt.legs[i + 1]} />
          )}
        </React.Fragment>
      ))}

      {/* Destination */}
      <TimelineNode
        color="#059669"
        icon={<Zap className="w-3.5 h-3.5 text-white" />}
        title={destination}
        subtitle={`Tiba · ${opt.arrival_time}`}
        big
        last
      />
    </div>
  );
};

const TimelineNode = ({ color, icon, title, subtitle, big, last }) => (
  <div className="relative pl-10 pb-4">
    {!last && <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200" />}
    <div
      className={`absolute left-0 ${big ? 'w-8 h-8' : 'w-6 h-6 left-[6px]'} rounded-full flex items-center justify-center shadow-sm`}
      style={{ backgroundColor: color }}
    >
      {icon}
    </div>
    <div className={big ? 'pt-1' : ''}>
      <div className="font-display font-bold text-slate-900 text-[15px] leading-tight">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 font-mono mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

const TimelineLeg = ({ leg }) => {
  const m = getMode(leg.mode);
  const Icon = MODE_ICON[leg.mode] || Bus;
  const isWalk = leg.mode === 'walk';

  return (
    <div className="relative pl-10 pb-4">
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5" style={{
        backgroundImage: isWalk ? `repeating-linear-gradient(0deg, ${m.primary} 0 4px, transparent 4px 8px)` : 'none',
        backgroundColor: isWalk ? 'transparent' : m.primary,
      }} />

      <div className="ml-2 rounded-lg p-3 border" style={{ backgroundColor: m.bg, borderColor: m.border }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.primary }}>
              <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: m.text }}>
                {isWalk ? 'Jalan Kaki' : m.fullLabel} {!isWalk && `· ${leg.route_code}`}
              </div>
              <div className="text-sm font-display font-bold text-slate-900 leading-tight">
                {leg.route_name}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">{leg.duration_min} min</div>
            {!isWalk && <div className="text-[10px] font-mono text-slate-500">Rp {leg.fare.toLocaleString('id-ID')}</div>}
          </div>
        </div>

        <div className="text-xs text-slate-700 flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
          <span>{leg.instruction}</span>
        </div>

        {!isWalk && (
          <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-slate-600">
            {leg.num_stops && <span>· {leg.num_stops} halte</span>}
            {leg.headway_min && <span>· setiap {leg.headway_min} min</span>}
          </div>
        )}

        {isWalk && leg.distance_m && (
          <div className="mt-2 text-[10px] font-mono text-slate-600">· {leg.distance_m} meter</div>
        )}
      </div>
    </div>
  );
};

const TimelineTransfer = ({ nextLeg }) => (
  <div className="relative pl-10 pb-3">
    <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200" />
    <div className="absolute left-[9px] top-1 w-[14px] h-[14px] rounded-full bg-white border-2 border-slate-400 flex items-center justify-center">
      <MapPin className="w-2 h-2 text-slate-600" />
    </div>
    <div className="ml-2 text-xs text-slate-600 font-medium flex items-center gap-2">
      <span className="font-mono">Transit di</span>
      <span className="font-display font-bold text-slate-900">{nextLeg.from_stop}</span>
    </div>
  </div>
);

// -------- Sticky Search Header --------
const SearchHeader = ({ origin, destination, onOriginChange, onDestChange, onSwap, onSubmit }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-100" />
          <input
            data-testid="search-header-origin"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Lokasi awal"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          type="button"
          data-testid="search-header-swap"
          onClick={onSwap}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-600"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-600" strokeWidth={2.5} />
          <input
            data-testid="search-header-destination"
            value={destination}
            onChange={(e) => onDestChange(e.target.value)}
            placeholder="Tujuan"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          type="button"
          data-testid="search-header-submit"
          onClick={onSubmit}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Cari
        </button>
      </div>
    </div>
  );
};

// ================= PAGE =================
export default function CariRute() {
  const [params, setParams] = useSearchParams();
  const [origin, setOrigin] = useState(params.get('from') || '');
  const [destination, setDestination] = useState(params.get('to') || '');
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchHubs().then(setHubs);
    fetchRoutes().then(setRoutes);
  }, []);

  const runSearch = useCallback((o, d) => {
    if (!o.trim() || !d.trim()) return;
    setLoading(true);
    setSearched(true);
    searchRoutes({ origin: o, destination: d })
      .then(res => {
        setOptions(res.options);
        setSelected(res.options[0]?.id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const f = params.get('from');
    const t = params.get('to');
    if (f && t) runSearch(f, t);
  }, [params, runSearch]);

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const submit = () => {
    setParams({ from: origin, to: destination });
    runSearch(origin, destination);
  };

  const active = options.find(o => o.id === selected);
  const activeRouteCodes = active ? active.legs.filter(l => l.mode !== 'walk').map(l => l.route_code) : [];

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Perencana Rute Multi-Moda</div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">Cari Rute Terbaik</h1>
        </div>

        {/* Sticky header */}
        <div className="sticky top-16 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-slate-50/95 backdrop-blur-sm border-y border-slate-200 sm:border-0 sm:rounded-none">
          <SearchHeader
            origin={origin}
            destination={destination}
            onOriginChange={setOrigin}
            onDestChange={setDestination}
            onSwap={swap}
            onSubmit={submit}
          />

          {!searched && (
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mr-2">Lokasi populer:</span>
              {QUICK_ORIGINS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setOrigin(loc)}
                  className="text-[11px] px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-medium"
                >
                  {loc}
                </button>
              ))}
              {QUICK_DEST.map(loc => (
                <button
                  key={loc}
                  onClick={() => setDestination(loc)}
                  className="text-[11px] px-2 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-medium"
                >
                  → {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {!searched && (
          <EmptyState onExample={() => {
            setOrigin('Stasiun Malang');
            setDestination('Universitas Brawijaya');
            setParams({ from: 'Stasiun Malang', to: 'Universitas Brawijaya' });
            runSearch('Stasiun Malang', 'Universitas Brawijaya');
          }} />
        )}

        {searched && (
          <div className="grid lg:grid-cols-5 gap-5 mt-5">
            {/* Options list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-baseline justify-between px-1">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                  {loading ? 'Mencari…' : `${options.length} Opsi Ditemukan`}
                </div>
                <div className="text-[11px] font-mono text-slate-500">Berangkat sekarang · 14:05</div>
              </div>

              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && options.length === 0 && (
                <div data-testid="no-routes" className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                  Tidak ada rute ditemukan.
                </div>
              )}

              {!loading && options.map((opt, i) => (
                <RouteOptionCard
                  key={opt.id}
                  opt={opt}
                  active={selected === opt.id}
                  onClick={() => setSelected(opt.id)}
                  index={i}
                />
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-3 space-y-4">
              {active && (
                <>
                  <div data-testid="route-detail" className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Detail Perjalanan</div>
                        <div className="font-display font-extrabold text-xl text-slate-900 mt-0.5">
                          {origin} <ArrowRight className="inline w-4 h-4 mx-1 text-slate-400" /> {destination}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                          <span className="flex items-center gap-1 text-slate-700"><Timer className="w-3.5 h-3.5" /> {active.total_duration_min} min</span>
                          <span className="flex items-center gap-1 text-slate-700"><Coins className="w-3.5 h-3.5" /> Rp {active.total_fare.toLocaleString('id-ID')}</span>
                          <span className="flex items-center gap-1 text-slate-700"><Repeat className="w-3.5 h-3.5" /> {active.transfers} transfer</span>
                          <span className="flex items-center gap-1 text-emerald-700"><Leaf className="w-3.5 h-3.5" /> -{active.co2_saved_kg} kg CO₂</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button data-testid="save-route" className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700" title="Simpan">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button data-testid="share-route" className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700" title="Bagikan">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-5">
                      <JourneyTimeline opt={active} origin={origin} destination={destination} />
                    </div>
                  </div>

                  {/* Map */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <MalangMap
                      hubs={hubs}
                      routes={routes}
                      activeRouteCodes={activeRouteCodes}
                      vehicles={[]}
                      height="360px"
                      testId="cari-rute-map"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const EmptyState = ({ onExample }) => (
  <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Navigation className="w-6 h-6 text-slate-500" />
    </div>
    <h3 className="font-display font-bold text-slate-900 text-lg mb-1">Mulai Rencanakan Perjalanan</h3>
    <p className="text-sm text-slate-600 max-w-md mx-auto">
      Masukkan lokasi awal dan tujuan untuk melihat opsi angkot, Trans Jatim, kereta, dan bus yang tersedia.
    </p>
    <button
      data-testid="try-example-btn"
      onClick={onExample}
      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
    >
      Coba contoh: Stasiun Malang → Universitas Brawijaya
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

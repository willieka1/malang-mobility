import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Radio, Building2, TrendingUp, Leaf, Users, ArrowRight, Route as RouteIcon, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import RouteSearchCard from '../components/RouteSearchCard';
import KpiTile from '../components/KpiTile';
import ModeChip from '../components/ModeChip';
import StatusBadge from '../components/StatusBadge';
import MalangMap from '../components/MalangMap';
import { fetchStats, fetchHubs, fetchLiveVehicles, fetchRoutes, fetchFleetSummary } from '../lib/api';

export default function Beranda() {
  const [stats, setStats] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [fleet, setFleet] = useState(null);

  useEffect(() => {
    fetchHubs().then(setHubs);
    fetchRoutes().then(setRoutes);
    fetchFleetSummary().then(setFleet);

    const loadLive = () => {
      fetchStats().then(setStats);
      fetchLiveVehicles().then(v => setVehicles(v.slice(0, 40)));
    };

    loadLive();
    const interval = setInterval(loadLive, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero + Search */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute inset-0 grid-noise opacity-40 pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 lg:py-14 grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] uppercase tracking-widest font-mono font-semibold text-slate-700">
                Live · 142 Armada Aktif · 18 Trayek Operasional
              </span>
            </div>
            <h1 className="font-display font-extrabold text-slate-900 text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              Transportasi Malang,<br />
              <span className="text-sky-700">Terhubung</span> dalam Satu Perjalanan.
            </h1>
            <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Temukan rute angkot, Trans Jatim, stasiun, dan terminal dalam satu sistem — dengan tracking armada, jadwal transit, dan peta multi-moda real-time.
            </p>

            <div className="mt-7 max-w-2xl">
              <RouteSearchCard />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">Moda Terintegrasi:</span>
              <ModeChip mode="angkot" code="9 Trayek Angkot" size="sm" />
              <ModeChip mode="trans_jatim" code="Trans Jatim K1" size="sm" />
              <ModeChip mode="kereta" code="KAI Commuter" size="sm" />
              <ModeChip mode="bus" code="Bus AKAP/AKDP" size="sm" />
            </div>
          </div>

          {/* Live Preview Map */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Peta Jaringan</div>
                  <div className="font-display font-bold text-slate-900">Kota Malang</div>
                </div>
                <Link to="/peta" data-testid="home-map-cta" className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1">
                  Peta lengkap <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <MalangMap
                hubs={hubs}
                vehicles={vehicles.slice(0, 20)}
                routes={routes}
                height="320px"
                testId="home-live-map"
              />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Real-time</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    On-air
                  </div>
                </div>
                <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Update</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">10s</div>
                </div>
                <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Akurasi</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">GPS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Ringkasan Operasi</div>
            <h2 className="font-display font-bold text-2xl text-slate-900">Kondisi Jaringan Saat Ini</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:block">Diperbarui otomatis · 10 detik</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            testId="kpi-vehicles"
            label="Armada Aktif"
            value={stats?.active_vehicles ?? '—'}
            unit="unit"
            icon={Bus}
            accent="#D97706"
            trend="+3 dari kemarin"
          />
          <KpiTile
            testId="kpi-routes"
            label="Trayek Tersedia"
            value={stats?.active_routes ?? '—'}
            unit="rute"
            icon={RouteIcon}
            accent="#0284C7"
            trend="9 angkot · 5 lainnya"
          />
          <KpiTile
            testId="kpi-hubs"
            label="Transit Hub"
            value={stats?.transit_hubs ?? '—'}
            unit="hub"
            icon={Building2}
            accent="#1E3A8A"
            trend="3 terminal · 3 stasiun"
          />
          <KpiTile
            testId="kpi-ontime"
            label="On-Time Rate"
            value={stats?.on_time_rate ?? '—'}
            unit="%"
            icon={TrendingUp}
            accent="#059669"
            trend="30 hari terakhir"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile testId="kpi-passengers" label="Penumpang Hari Ini" value={stats?.passengers_today?.toLocaleString('id-ID') ?? '—'} unit="orang" icon={Users} accent="#7C3AED" />
          <KpiTile testId="kpi-co2" label="CO₂ Ditekan" value={stats?.co2_saved_today?.toLocaleString('id-ID') ?? '—'} unit="kg" icon={Leaf} accent="#059669" />
          <KpiTile testId="kpi-health" label="Skor Kesehatan Armada" value={fleet?.avg_health_score ?? '—'} unit="/100" icon={Activity} accent="#0284C7" />
          <KpiTile testId="kpi-fleet-live" label="Live Tracking" value={vehicles.length} unit="unit" icon={Radio} accent="#EF4444" trend="Streaming langsung" />
        </div>
      </section>

      {/* Featured Routes + Hubs */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-14 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Trayek Angkot Utama</h3>
            <Link to="/peta" className="text-xs text-sky-700 font-semibold hover:underline">Lihat semua →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {routes.filter(r => r.mode === 'angkot').slice(0, 5).map(r => (
              <div key={r.code} data-testid={`route-row-${r.code}`} className="py-3 flex items-center gap-4">
                <ModeChip mode={r.mode} code={r.code} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{r.stops} halte · setiap {r.frequency_min} menit</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900 text-sm">Rp {r.fare.toLocaleString('id-ID')}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{r.duration_min} min</div>
                </div>
                <StatusBadge status="tepat_waktu" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Hub Terintegrasi</h3>
            <Link to="/transit-hub" className="text-xs text-sky-700 font-semibold hover:underline">Lihat semua →</Link>
          </div>
          <div className="space-y-3">
            {hubs.slice(0, 4).map(h => (
              <Link
                key={h.id}
                to={`/transit-hub`}
                data-testid={`hub-tile-${h.id}`}
                className="block p-3 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${h.type === 'terminal' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {h.type === 'terminal' ? <Bus className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{h.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{h.connections.length} moda · {h.active_vehicles} unit aktif</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

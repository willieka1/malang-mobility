import React, { useEffect, useState } from 'react';
import { Building2, Bus, Train, Wifi, Toilet, Utensils, CreditCard, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import MalangMap from '../components/MalangMap';
import { fetchHubs, fetchRoutes } from '../lib/api';

const AMENITY_ICONS = {
  'Toilet': Toilet,
  'Musala': Building2,
  'Kios': Utensils,
  'Warung': Utensils,
  'ATM': CreditCard,
  'Free WiFi': Wifi,
};

export default function TransitHub() {
  const [hubs, setHubs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHubs().then(hs => {
      setHubs(hs);
      setSelected(hs[0]?.id);
    });
    fetchRoutes().then(setRoutes);
  }, []);

  const activeHub = hubs.find(h => h.id === selected);

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Simpul Integrasi</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Transit Hub Kota Malang</h1>
          <p className="text-slate-600 mt-1">Terminal dan stasiun sebagai titik pertemuan angkot, Trans Jatim, kereta, dan bus antarkota.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {hubs.map(h => (
            <button
              key={h.id}
              data-testid={`hub-card-${h.id}`}
              onClick={() => setSelected(h.id)}
              className={`text-left bg-white border rounded-2xl p-5 transition-all ${
                selected === h.id ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  h.type === 'terminal' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {h.type === 'terminal' ? <Bus className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${
                  h.type === 'terminal' ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'
                }`}>
                  {h.type === 'terminal' ? 'Terminal' : 'Stasiun'}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">{h.name}</h3>
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3" /> {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Kapasitas</div>
                  <div className="font-mono font-bold text-slate-900">{h.capacity} <span className="text-xs text-slate-500 font-normal">unit</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Aktif</div>
                  <div className="font-mono font-bold text-emerald-700">{h.active_vehicles} <span className="text-xs text-slate-500 font-normal">unit</span></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {activeHub && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-display font-bold text-xl text-slate-900 mb-1">{activeHub.name}</h3>
              <div className="text-xs text-slate-500 font-mono mb-5">Detail Hub Terintegrasi</div>

              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-2">Moda Terhubung</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeHub.connections.map(c => (
                    <span key={c} className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-2">Fasilitas</div>
                <div className="grid grid-cols-2 gap-2">
                  {activeHub.amenities.map(a => {
                    const Icon = AMENITY_ICONS[a] || Building2;
                    return (
                      <div key={a} className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-100">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Kapasitas Terminal</div>
                  <div className="font-mono font-bold text-2xl text-slate-900">{activeHub.capacity}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Utilisasi</div>
                  <div className="font-mono font-bold text-2xl text-emerald-700">
                    {Math.round((activeHub.active_vehicles / activeHub.capacity) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <MalangMap
                hubs={[activeHub]}
                routes={routes.filter(r => activeHub.connections.some(c => c.includes(r.code)))}
                vehicles={[]}
                center={[activeHub.lat, activeHub.lng]}
                zoom={15}
                height="480px"
                testId="hub-detail-map"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { MapPin, ArrowRight, ArrowUpDown, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_ORIGINS = ['Kampus UB', 'Alun-Alun Malang', 'Stasiun Malang', 'Terminal Arjosari'];
const QUICK_DEST = ['Terminal Landungsari', 'Malang Town Square', 'Stasiun Kepanjen', 'Batu'];

export const RouteSearchCard = ({ compact = false }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('sekarang');
  const navigate = useNavigate();

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    const params = new URLSearchParams({ from: origin, to: destination, time });
    navigate(`/cari-rute?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} data-testid="route-search-card" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-slate-900">Rencanakan Perjalanan</h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Multi-Moda</span>
      </div>

      <div className="relative space-y-2">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
          <input
            data-testid="route-search-origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Dari mana?"
            className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <button
          type="button"
          onClick={swap}
          data-testid="route-swap-btn"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-600 z-10 shadow-sm"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <MapPin className="w-4 h-4 text-sky-600" strokeWidth={2.5} />
          </div>
          <input
            data-testid="route-search-destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ke mana?"
            className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mr-1 self-center">Cepat:</span>
          {QUICK_ORIGINS.slice(0, 2).map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => setOrigin(loc)}
              className="text-[11px] px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-medium"
            >
              {loc}
            </button>
          ))}
          {QUICK_DEST.slice(0, 2).map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => setDestination(loc)}
              className="text-[11px] px-2 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-medium"
            >
              → {loc}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <Clock className="w-4 h-4 text-slate-500" />
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            data-testid="route-search-time"
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          >
            <option value="sekarang">Berangkat Sekarang</option>
            <option value="15min">15 Menit Lagi</option>
            <option value="30min">30 Menit Lagi</option>
            <option value="1h">1 Jam Lagi</option>
          </select>
        </div>

        <button
          type="submit"
          data-testid="route-search-submit"
          className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Cari Rute
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default RouteSearchCard;

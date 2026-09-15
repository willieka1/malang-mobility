import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bus, Search, Map, Radio, Building2, Wrench, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Bus, testId: 'nav-beranda' },
  { to: '/cari-rute', label: 'Cari Rute', icon: Search, testId: 'nav-cari-rute' },
  { to: '/peta', label: 'Peta', icon: Map, testId: 'nav-peta' },
  { to: '/live-tracking', label: 'Live Tracking', icon: Radio, testId: 'nav-live-tracking' },
  { to: '/transit-hub', label: 'Transit Hub', icon: Building2, testId: 'nav-transit-hub' },
  { to: '/armada', label: 'Armada', icon: Wrench, testId: 'nav-armada' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" data-testid="brand-logo" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center relative">
            <Bus className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-[17px] text-slate-900 tracking-tight">Malang Mobility</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Transit OS · v1.0</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-[13.5px] font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div data-testid="system-status-badge" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">SISTEM NORMAL</span>
          </div>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-md"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`${item.testId}-mobile`}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 font-mono">Sistem Operasional Normal</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

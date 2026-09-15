import React from 'react';
import { Bus } from 'lucide-react';

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white mt-16">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <Bus className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-slate-900 text-sm">Malang Mobility</div>
          <div className="text-xs text-slate-500 font-mono">Integrasi Transportasi Kota Malang · Data simulasi</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 font-mono">
        © 2026 Malang Mobility · Dinas Perhubungan Kota Malang (Demo)
      </div>
    </div>
  </footer>
);

export default Footer;

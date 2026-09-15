import React from 'react';
import { Bus, Train, TramFront, Footprints } from 'lucide-react';
import { getMode } from '../lib/modes';

const ICONS = {
  angkot: TramFront,
  trans_jatim: Bus,
  kereta: Train,
  bus: Bus,
  walk: Footprints,
};

export const ModeChip = ({ mode, code, className = '', size = 'md' }) => {
  const m = getMode(mode);
  const Icon = ICONS[mode] || Bus;
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-2.5 py-1.5 gap-1.5',
  };
  const iconSize = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md font-mono ${sizes[size]} ${className}`}
      style={{ backgroundColor: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      <Icon className={iconSize} strokeWidth={2.5} />
      {code || m.label}
    </span>
  );
};

export default ModeChip;

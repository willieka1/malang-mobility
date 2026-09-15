import React from 'react';
import { STATUS } from '../lib/modes';

export const StatusBadge = ({ status, className = '' }) => {
  const s = STATUS[status] || STATUS.perawatan;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
};

export default StatusBadge;

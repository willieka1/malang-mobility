import React, { useEffect, useMemo, useState } from 'react';

const MALANG_CENTER = [-7.9666, 112.6326];

const ROUTE_POLYLINES = {
  AL: [[-7.9186, 112.6540], [-7.9350, 112.6420], [-7.9550, 112.6280], [-7.9312, 112.5924]],
  ADL: [[-7.9186, 112.6540], [-7.9450, 112.6300], [-7.9650, 112.6100], [-7.9312, 112.5924]],
  GL: [[-8.0246, 112.6291], [-7.9950, 112.6180], [-7.9700, 112.6080], [-7.9312, 112.5924]],
  AG: [[-7.9186, 112.6540], [-7.9500, 112.6480], [-7.9800, 112.6380], [-8.0246, 112.6291]],
  LDG: [[-7.9312, 112.5924], [-7.9600, 112.6080], [-7.9900, 112.6220], [-8.0246, 112.6291]],
  AT: [[-7.9186, 112.6540], [-7.9050, 112.6800], [-7.9200, 112.7100]],
  CKL: [[-7.9500, 112.6600], [-7.9600, 112.6300], [-7.9700, 112.6100], [-7.9312, 112.5924]],
  GA: [[-8.0246, 112.6291], [-7.9800, 112.6400], [-7.9500, 112.6470], [-7.9186, 112.6540]],
  MK: [[-7.9450, 112.6800], [-7.9600, 112.6500]],
  AMG: [[-7.9186, 112.6540], [-7.9500, 112.6750], [-7.9700, 112.6650]],
  'TJ-K1': [[-7.8353, 112.6952], [-7.9186, 112.6540], [-7.9776, 112.6376], [-8.0246, 112.6291]],
  'KAI-ML': [[-7.9776, 112.6376], [-7.9962, 112.6412], [-8.0246, 112.6291]],
  'KAI-KPN': [[-7.9776, 112.6376], [-7.9962, 112.6412]],
  'BUS-SBY': [[-7.9186, 112.6540], [-7.8353, 112.6952]],
  'BUS-BLT': [[-8.0246, 112.6291], [-7.9962, 112.6412]],
};

const MODE_LABEL = {
  angkot: 'Angkot',
  trans_jatim: 'Trans Jatim',
  kereta: 'Kereta Api',
  bus: 'Bus Antarkota',
};

const STATUS_DOT = {
  tepat_waktu: '#22C55E',
  padat: '#F59E0B',
  terlambat: '#EF4444',
  perawatan: '#94A3B8',
};

const BOUNDS = { minLat: -8.08, maxLat: -7.79, minLng: 112.54, maxLng: 112.74 };

const toPoint = ([lat, lng]) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 1000,
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 620,
});

const linePoints = (line) => line.map(toPoint).map(p => `${p.x},${p.y}`).join(' ');

const Road = ({ d, width = 9, opacity = 0.65 }) => (
  <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);

const NetworkMap = ({ hubs, vehicles, routes, activeRouteCodes, onVehicleClick, selectedVehicle, view, setView }) => {
  const visibleRoutes = routes.filter(r => ROUTE_POLYLINES[r.code]);
  const transform = `translate(${500 - view.cx * view.scale} ${310 - view.cy * view.scale}) scale(${view.scale})`;

  return (
    <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full bg-slate-100" role="img" aria-label="Peta jaringan transportasi Kota Malang">
      <defs>
        <pattern id="map-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#D8E0E8" strokeWidth="1" opacity="0.7" />
        </pattern>
        <filter id="map-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect width="1000" height="620" fill="#E8F0F2" />
      <rect width="1000" height="620" fill="url(#map-grid)" />
      <path d="M720 -20 C690 100 760 180 705 285 C650 390 755 485 690 650 L1010 650 L1010 -20 Z" fill="#DCEFF0" opacity="0.9" />

      <g transform={transform}>
        {/* Simplified city road network. It is intentionally local/self-contained so the demo never depends on map tile servers. */}
        <Road d="M50 155 C250 125 350 185 515 165 S820 120 975 175" width="18" opacity="0.9" />
        <Road d="M90 475 C250 405 350 435 520 390 S780 340 965 430" width="20" opacity="0.9" />
        <Road d="M250 15 C270 150 245 265 305 360 S355 520 330 640" width="15" opacity="0.85" />
        <Road d="M585 5 C540 135 590 225 545 330 S570 510 635 650" width="15" opacity="0.85" />
        <Road d="M65 310 C230 285 365 315 505 300 S790 280 960 320" width="12" opacity="0.8" />
        <Road d="M420 30 C440 145 410 250 455 360 S455 535 470 620" width="8" opacity="0.7" />

        {/* Transit routes */}
        {visibleRoutes.map(r => {
          const active = activeRouteCodes.length === 0 || activeRouteCodes.includes(r.code);
          return (
            <polyline
              key={r.code}
              points={linePoints(ROUTE_POLYLINES[r.code])}
              fill="none"
              stroke={r.color}
              strokeWidth={active ? 5 : 2}
              strokeOpacity={active ? 0.9 : 0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Hub markers */}
        {hubs.map(h => {
          const p = toPoint([h.lat, h.lng]);
          const railway = h.type === 'railway';
          return (
            <g key={h.id} transform={`translate(${p.x} ${p.y})`} filter="url(#map-shadow)" className="cursor-pointer">
              <circle r="15" fill={railway ? '#1E3A8A' : '#059669'} stroke="white" strokeWidth="3" />
              <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="800">{railway ? 'R' : 'B'}</text>
              <g transform="translate(18 -13)">
                <rect width={Math.min(170, Math.max(90, h.name.length * 7))} height="24" rx="7" fill="white" fillOpacity="0.95" stroke="#CBD5E1" />
                <text x="9" y="16" fontSize="10" fontWeight="700" fill="#0F172A">{h.name}</text>
              </g>
            </g>
          );
        })}

        {/* Live vehicle markers */}
        {vehicles.map(v => {
          const p = toPoint([v.lat, v.lng]);
          const active = selectedVehicle?.id === v.id;
          return (
            <g
              key={v.id}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer"
              onClick={() => onVehicleClick?.(v)}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            >
              {v.operational_status === 'beroperasi' && <circle r={active ? 13 : 9} fill={v.color} opacity="0.16" className="animate-pulse" />}
              <circle r={active ? 10 : 8} fill={v.color} stroke="white" strokeWidth={active ? 3 : 2} filter="url(#map-shadow)" />
              <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize="7" fontWeight="800">{v.route_code.slice(0, 3)}</text>
            </g>
          );
        })}
      </g>

      <g transform="translate(18 18)">
        <rect width="230" height="62" rx="12" fill="white" fillOpacity="0.95" stroke="#CBD5E1" />
        <text x="14" y="22" fontSize="10" fontWeight="800" fill="#475569" letterSpacing="1.5">MALANG MOBILITY</text>
        <text x="14" y="43" fontSize="15" fontWeight="800" fill="#0F172A">Jaringan Transportasi</text>
        <circle cx="205" cy="21" r="5" fill="#22C55E" />
        <text x="216" y="25" fontSize="9" fontWeight="700" fill="#15803D">LIVE</text>
      </g>

      <g transform="translate(18 535)">
        <rect width="285" height="62" rx="12" fill="white" fillOpacity="0.95" stroke="#CBD5E1" />
        <circle cx="22" cy="22" r="6" fill="#D97706" /><text x="36" y="26" fontSize="10" fill="#334155">Angkot</text>
        <circle cx="103" cy="22" r="6" fill="#0284C7" /><text x="117" y="26" fontSize="10" fill="#334155">Trans Jatim</text>
        <circle cx="207" cy="22" r="6" fill="#1E3A8A" /><text x="221" y="26" fontSize="10" fill="#334155">Kereta</text>
        <circle cx="22" cy="45" r="6" fill="#059669" /><text x="36" y="49" fontSize="10" fill="#334155">Bus</text>
        <text x="103" y="49" fontSize="10" fill="#64748B">GPS simulasi untuk demo</text>
      </g>

      <g transform="translate(930 20)">
        <rect width="50" height="94" rx="12" fill="white" fillOpacity="0.96" stroke="#CBD5E1" />
        <g onClick={() => setView(v => ({ ...v, scale: Math.min(1.9, v.scale + 0.18) }))} className="cursor-pointer">
          <rect x="10" y="10" width="30" height="30" rx="8" fill="#F8FAFC" />
          <text x="25" y="31" textAnchor="middle" fontSize="22" fill="#0F172A">+</text>
        </g>
        <g onClick={() => setView(v => ({ ...v, scale: Math.max(0.8, v.scale - 0.18) }))} className="cursor-pointer">
          <rect x="10" y="51" width="30" height="30" rx="8" fill="#F8FAFC" />
          <text x="25" y="72" textAnchor="middle" fontSize="22" fill="#0F172A">−</text>
        </g>
      </g>
    </svg>
  );
};

export const MalangMap = ({
  hubs = [],
  vehicles = [],
  routes = [],
  activeRouteCodes = [],
  height = '500px',
  center = MALANG_CENTER,
  zoom = 13,
  fitBounds = null,
  onVehicleClick = null,
  mapRef = null,
  testId = 'malang-map',
}) => {
  const centerPoint = toPoint(center);
  const [view, setView] = useState({ cx: centerPoint.x, cy: centerPoint.y, scale: zoom >= 14 ? 1.45 : 1.15 });
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    if (fitBounds && fitBounds.length) {
      const points = fitBounds.map(toPoint);
      const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
      const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
      setView(v => ({ ...v, cx, cy }));
    }
  }, [fitBounds]);

  useEffect(() => {
    if (!mapRef) return;
    mapRef.current = {
      flyTo: ([lat, lng], nextZoom = 15) => {
        const p = toPoint([lat, lng]);
        setView({ cx: p.x, cy: p.y, scale: nextZoom >= 16 ? 1.75 : 1.5 });
      },
      setView,
    };
    return () => { mapRef.current = null; };
  }, [mapRef]);

  useEffect(() => {
    if (selectedVehicle && !vehicles.some(v => v.id === selectedVehicle.id)) setSelectedVehicle(null);
  }, [vehicles, selectedVehicle]);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    onVehicleClick?.(vehicle);
  };

  const selected = selectedVehicle || null;
  const selectedPoint = useMemo(() => selected ? toPoint([selected.lat, selected.lng]) : null, [selected]);

  return (
    <div data-testid={testId} className="relative w-full rounded-xl overflow-hidden border border-slate-200" style={{ height }}>
      <NetworkMap
        hubs={hubs}
        vehicles={vehicles}
        routes={routes}
        activeRouteCodes={activeRouteCodes}
        onVehicleClick={handleVehicleClick}
        selectedVehicle={selected}
        view={view}
        setView={setView}
      />
      {selected && selectedPoint && (
        <div className="absolute right-4 top-4 w-[280px] max-w-[calc(100%-32px)] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-4 z-20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono" style={{ color: selected.color }}>{MODE_LABEL[selected.mode] || selected.mode}</div>
              <div className="font-bold text-slate-900 text-sm mt-1">{selected.route_code} · {selected.route_name}</div>
            </div>
            <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-slate-900 text-lg leading-none" aria-label="Tutup">×</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
            <div><div className="text-[9px] uppercase text-slate-400">Kecepatan</div><div className="font-mono font-bold">{selected.speed_kmh} km/j</div></div>
            <div><div className="text-[9px] uppercase text-slate-400">Status</div><div className="font-semibold" style={{ color: STATUS_DOT[selected.status] }}>{selected.status.replace('_', ' ')}</div></div>
            <div><div className="text-[9px] uppercase text-slate-400">Kepadatan</div><div className="font-semibold">{selected.crowd}</div></div>
            <div><div className="text-[9px] uppercase text-slate-400">ETA Halte</div><div className="font-mono font-bold">{selected.next_stop_eta_min} min</div></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">ID {selected.id} · posisi simulasi GPS</div>
        </div>
      )}
    </div>
  );
};

export default MalangMap;
export { ROUTE_POLYLINES, MALANG_CENTER };

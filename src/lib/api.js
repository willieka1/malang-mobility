/*
 * Frontend-only demo data layer.
 *
 * The competition build is deployed to Vercel as a static React app, so the
 * UI must not depend on FastAPI or any /api endpoint. These functions keep the
 * same interface used by the existing pages, but resolve data locally.
 */

const ROUTES = [
  { code: 'AL', name: 'Arjosari - Landungsari', mode: 'angkot', color: '#D97706', fare: 5000, stops: 24, duration_min: 45, frequency_min: 8, active_units: 18, operator: 'Koperasi Angkot Malang' },
  { code: 'ADL', name: 'Arjosari - Dinoyo - Landungsari', mode: 'angkot', color: '#D97706', fare: 5000, stops: 28, duration_min: 55, frequency_min: 10, active_units: 22, operator: 'Koperasi Angkot Malang' },
  { code: 'GL', name: 'Gadang - Landungsari', mode: 'angkot', color: '#D97706', fare: 5000, stops: 26, duration_min: 50, frequency_min: 9, active_units: 20, operator: 'Koperasi Angkot Malang' },
  { code: 'AG', name: 'Arjosari - Gadang', mode: 'angkot', color: '#D97706', fare: 5000, stops: 20, duration_min: 40, frequency_min: 8, active_units: 16, operator: 'Koperasi Angkot Malang' },
  { code: 'LDG', name: 'Landungsari - Dinoyo - Gadang', mode: 'angkot', color: '#D97706', fare: 5000, stops: 22, duration_min: 42, frequency_min: 10, active_units: 14, operator: 'Koperasi Angkot Malang' },
  { code: 'AT', name: 'Arjosari - Tumpang', mode: 'angkot', color: '#D97706', fare: 7000, stops: 18, duration_min: 55, frequency_min: 15, active_units: 10, operator: 'Koperasi Angkot Tumpang' },
  { code: 'CKL', name: 'Cemorokandang - Kalpataru - Landungsari', mode: 'angkot', color: '#D97706', fare: 5000, stops: 21, duration_min: 48, frequency_min: 12, active_units: 12, operator: 'Koperasi Angkot Malang' },
  { code: 'GA', name: 'Gadang - Arjosari', mode: 'angkot', color: '#D97706', fare: 5000, stops: 19, duration_min: 38, frequency_min: 9, active_units: 15, operator: 'Koperasi Angkot Malang' },
  { code: 'MK', name: 'Mulyorejo - Kacuk', mode: 'angkot', color: '#D97706', fare: 5000, stops: 16, duration_min: 32, frequency_min: 12, active_units: 8, operator: 'Koperasi Angkot Malang' },
  { code: 'AMG', name: 'Arjosari - Madyopuro', mode: 'angkot', color: '#D97706', fare: 5000, stops: 17, duration_min: 36, frequency_min: 12, active_units: 12, operator: 'Koperasi Angkot Malang' },
  { code: 'TJ-K1', name: 'Trans Jatim Koridor 1: Porong - Malang', mode: 'trans_jatim', color: '#0284C7', fare: 8000, stops: 32, duration_min: 110, frequency_min: 20, active_units: 12, operator: 'Trans Jatim - Pemprov Jatim' },
  { code: 'KAI-ML', name: 'Commuter Line Malang - Surabaya', mode: 'kereta', color: '#1E3A8A', fare: 12000, stops: 8, duration_min: 120, frequency_min: 60, active_units: 6, operator: 'PT KAI Commuter' },
  { code: 'KAI-KPN', name: 'KA Lokal Malang - Kepanjen', mode: 'kereta', color: '#1E3A8A', fare: 8000, stops: 5, duration_min: 45, frequency_min: 90, active_units: 4, operator: 'PT KAI' },
  { code: 'BUS-SBY', name: 'Bus AKAP Malang - Surabaya', mode: 'bus', color: '#059669', fare: 25000, stops: 6, duration_min: 150, frequency_min: 30, active_units: 8, operator: 'PO Restu / Kalisari' },
  { code: 'BUS-BLT', name: 'Bus AKDP Malang - Blitar', mode: 'bus', color: '#059669', fare: 20000, stops: 8, duration_min: 90, frequency_min: 45, active_units: 6, operator: 'PO Bagong / Puspa Indah' },
];

const HUBS = [
  { id: 'hub-arjosari', name: 'Terminal Arjosari', type: 'terminal', lat: -7.9186, lng: 112.6540, connections: ['AL', 'ADL', 'AG', 'AT', 'Trans Jatim K1'], amenities: ['Toilet', 'Musala', 'Kios', 'ATM'], capacity: 45, active_vehicles: 28 },
  { id: 'hub-landungsari', name: 'Terminal Landungsari', type: 'terminal', lat: -7.9312, lng: 112.5924, connections: ['AL', 'ADL', 'LDG', 'GL'], amenities: ['Toilet', 'Kios', 'Warung'], capacity: 30, active_vehicles: 19 },
  { id: 'hub-gadang', name: 'Terminal Gadang', type: 'terminal', lat: -8.0246, lng: 112.6291, connections: ['GL', 'AG', 'GA', 'LDG'], amenities: ['Toilet', 'Musala', 'Kios'], capacity: 25, active_vehicles: 16 },
  { id: 'hub-mkb', name: 'Stasiun Malang Kota Baru', type: 'railway', lat: -7.9776, lng: 112.6376, connections: ['KAI', 'Commuter Line', 'AL', 'ADL'], amenities: ['Toilet', 'Musala', 'Kios', 'ATM', 'Free WiFi'], capacity: 60, active_vehicles: 12 },
  { id: 'hub-mkl', name: 'Stasiun Malang Kota Lama', type: 'railway', lat: -7.9962, lng: 112.6412, connections: ['KAI Lokal', 'GL', 'GA'], amenities: ['Toilet', 'Warung'], capacity: 20, active_vehicles: 6 },
  { id: 'hub-lawang', name: 'Stasiun Lawang', type: 'railway', lat: -7.8353, lng: 112.6952, connections: ['KAI', 'Trans Jatim K1'], amenities: ['Toilet', 'Kios'], capacity: 15, active_vehicles: 4 },
];

const STOPS_BY_ROUTE = {
  AL: ['Halte Arjosari', 'Halte Blimbing', 'Halte Soekarno-Hatta', 'Halte Kayutangan', 'Halte Sudimoro', 'Halte Dinoyo', 'Halte Sigura-gura', 'Halte Landungsari'],
  ADL: ['Halte Arjosari', 'Halte Blimbing', 'Halte Pasar Blimbing', 'Halte MT Haryono', 'Halte Dinoyo', 'Halte Universitas Brawijaya', 'Halte Landungsari'],
  GL: ['Halte Gadang', 'Halte Kacuk', 'Halte Sukun', 'Halte Klojen', 'Halte Kayutangan', 'Halte Sigura-gura', 'Halte Landungsari'],
  AG: ['Halte Arjosari', 'Halte Blimbing', 'Halte Alun-Alun', 'Halte Sukun', 'Halte Gadang'],
  LDG: ['Halte Landungsari', 'Halte Dinoyo', 'Halte Klojen', 'Halte Kacuk', 'Halte Gadang'],
  AT: ['Halte Arjosari', 'Halte Blimbing', 'Halte Pakis', 'Halte Tumpang'],
  CKL: ['Halte Cemorokandang', 'Halte Sawojajar', 'Halte Kalpataru', 'Halte Kayutangan', 'Halte Dinoyo', 'Halte Landungsari'],
  GA: ['Halte Gadang', 'Halte Sukun', 'Halte Alun-Alun', 'Halte Blimbing', 'Halte Arjosari'],
  MK: ['Halte Mulyorejo', 'Halte Sulfat', 'Halte Sawojajar', 'Halte Kacuk'],
  AMG: ['Halte Arjosari', 'Halte Sawojajar', 'Halte Sulfat', 'Halte Madyopuro'],
  'TJ-K1': ['Halte Porong', 'Halte Pandaan', 'Halte Lawang', 'Halte Singosari', 'Halte Blimbing', 'Halte Malang Kota Baru', 'Halte Kepanjen'],
  'KAI-ML': ['Malang Kota Baru', 'Lawang', 'Bangil', 'Surabaya Gubeng'],
  'KAI-KPN': ['Malang Kota Baru', 'Malang Kota Lama', 'Pakisaji', 'Kepanjen'],
  'BUS-SBY': ['Terminal Arjosari', 'Bungurasih Surabaya'],
  'BUS-BLT': ['Terminal Gadang', 'Terminal Blitar'],
};

const MODE_LABEL = { angkot: 'Angkot', trans_jatim: 'Bus BRT', kereta: 'Kereta Api', bus: 'Bus' };
const CO2_BASELINE = { angkot: 2400, trans_jatim: 5200, kereta: 1200, bus: 6800 };
const COST_PER_UNIT = { angkot: 280000000, trans_jatim: 1800000000, kereta: 8500000000, bus: 950000000 };

const seeded = (n) => {
  const x = Math.sin(n * 999.91) * 43758.5453;
  return x - Math.floor(x);
};

const deriveCondition = (year, mode) => {
  const age = 2026 - year;
  if (mode === 'kereta') {
    if (age >= 20) return ['Perlu Peremajaan', 'Perlu Evaluasi'];
    if (age >= 10) return ['Perlu Perawatan', 'Aktif'];
    return ['Baik', 'Aktif'];
  }
  if (age >= 12) return ['Perlu Peremajaan', 'Perlu Evaluasi'];
  if (age >= 7) return ['Perlu Perawatan', 'Aktif'];
  return ['Baik', 'Aktif'];
};

const annualCo2 = (mode, year) => {
  const base = CO2_BASELINE[mode] || 3000;
  const age = Math.max(0, 2026 - year);
  return Math.round(base * (1 + Math.max(0, age - 5) * 0.05));
};

const vehicles = ROUTES.flatMap((route, routeIndex) => {
  const count = Math.min(Math.max(Math.min(route.active_units, 4), 2), 4);
  const stops = STOPS_BY_ROUTE[route.code] || ['Halte Terdekat'];
  return Array.from({ length: count }, (_, i) => {
    const seed = routeIndex * 10 + i + 1;
    const op = seeded(seed) < 0.78 ? 'beroperasi' : seeded(seed + 1) < 0.6 ? 'berhenti' : 'perawatan';
    const year = 2009 + Math.floor(seeded(seed + 2) * 16);
    let [kondisi, status_armada] = deriveCondition(year, route.mode);
    if (op === 'perawatan') kondisi = 'Perlu Perawatan';
    const lat = -7.98 + (seeded(seed + 3) - 0.5) * 0.09;
    const lng = 112.63 + (seeded(seed + 4) - 0.5) * 0.10;
    const mileage = 40000 + Math.floor(seeded(seed + 5) * 45000) * Math.max(1, 2026 - year);
    const kmSince = 2500 + Math.floor(seeded(seed + 6) * 15000);
    return {
      id: `${route.code}-${String(i + 1).padStart(3, '0')}`,
      route_code: route.code,
      route_name: route.name,
      mode: route.mode,
      jenis: MODE_LABEL[route.mode] || 'Kendaraan',
      color: route.color,
      plate: `N ${1000 + Math.floor(seeded(seed + 7) * 8999)} ${['AB', 'CD', 'EF', 'MG'][seed % 4]}`,
      year,
      kondisi,
      status_armada,
      mileage_km: mileage,
      km_since_service: kmSince,
      next_service_km: 15000,
      co2_kg_per_year: annualCo2(route.mode, year),
      replacement_cost: COST_PER_UNIT[route.mode] || 500000000,
      lat,
      lng,
      speed_kmh: op === 'beroperasi' ? 18 + Math.floor(seeded(seed + 8) * 30) : 0,
      status: op === 'perawatan' ? 'perawatan' : seeded(seed + 9) < 0.78 ? 'tepat_waktu' : seeded(seed + 10) < 0.5 ? 'padat' : 'terlambat',
      operational_status: op,
      crowd: ['Longgar', 'Sedang', 'Penuh'][seed % 3],
      next_stop: stops[seed % stops.length],
      next_stop_eta_min: op === 'beroperasi' ? 2 + (seed % 10) : 0,
      driver: ['Pak Budi', 'Pak Sutrisno', 'Pak Wahyu', 'Pak Agus', 'Pak Joko'][seed % 5],
      fuel_pct: 45 + (seed * 7) % 50,
      last_maintenance: `${1 + (seed * 3) % 27} Jan 2026`,
      last_update_iso: new Date().toISOString(),
      heading: (seed * 37) % 360,
    };
  });
});

const approvalState = {};

// Mutate local vehicle positions to make the demo visibly live.
const tickVehicles = () => {
  const now = new Date().toISOString();
  vehicles.forEach((v, i) => {
    if (v.operational_status === 'beroperasi') {
      const step = 0.00018 + (i % 4) * 0.000035;
      const direction = i % 2 === 0 ? 1 : -1;
      v.lat += step * direction;
      v.lng += step * (i % 3 === 0 ? -1 : 1);
      if (v.lat > -7.90 || v.lat < -8.05) v.lat = -7.98;
      if (v.lng > 112.71 || v.lng < 112.58) v.lng = 112.63;
      v.speed_kmh = Math.max(8, Math.min(55, v.speed_kmh + (i % 3 === 0 ? 1 : -1)));
      v.heading = (v.heading + (i % 2 ? 3 : -3) + 360) % 360;
      v.next_stop_eta_min = Math.max(1, v.next_stop_eta_min - 1);
    }
    v.last_update_iso = now;
  });
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export const API = null;
export const api = null;

export const fetchStats = async () => ({
  active_vehicles: vehicles.length,
  active_routes: ROUTES.length,
  transit_hubs: HUBS.length,
  on_time_rate: 96.4,
  co2_saved_today: 3420,
  passengers_today: 24831,
  updated_at: new Date().toISOString(),
});

export const fetchRoutes = async (mode) => clone(mode ? ROUTES.filter(r => r.mode === mode) : ROUTES);
export const fetchHubs = async () => clone(HUBS);
export const fetchLiveVehicles = async (mode) => {
  tickVehicles();
  const result = mode ? vehicles.filter(v => v.mode === mode) : vehicles;
  return clone(result);
};
export const fetchLiveStats = async () => {
  tickVehicles();
  const beroperasi = vehicles.filter(v => v.operational_status === 'beroperasi');
  return {
    kendaraan_aktif: vehicles.length,
    beroperasi: beroperasi.length,
    berhenti: vehicles.filter(v => v.operational_status === 'berhenti').length,
    perlu_perawatan: vehicles.filter(v => v.operational_status === 'perawatan').length,
    avg_speed_kmh: Math.round((beroperasi.reduce((sum, v) => sum + v.speed_kmh, 0) / Math.max(1, beroperasi.length)) * 10) / 10,
    server_time_iso: new Date().toISOString(),
    data_source: 'SIMULATED_GPS',
  };
};

export const fetchFleetSummary = async () => {
  const breakdown_by_mode = {};
  ROUTES.forEach(r => {
    if (!breakdown_by_mode[r.mode]) breakdown_by_mode[r.mode] = { units: 0, routes: 0 };
    breakdown_by_mode[r.mode].units += r.active_units;
    breakdown_by_mode[r.mode].routes += 1;
  });
  return {
    total_units: ROUTES.reduce((s, r) => s + r.active_units, 0),
    operational: vehicles.filter(v => v.operational_status === 'beroperasi').length,
    maintenance: vehicles.filter(v => v.operational_status === 'perawatan').length,
    out_of_service: vehicles.filter(v => v.operational_status === 'berhenti').length,
    avg_health_score: 87.4,
    on_time_rate: 96.4,
    avg_fuel_pct: Math.round(vehicles.reduce((s, v) => s + v.fuel_pct, 0) / vehicles.length),
    co2_saved_kg_today: 3420,
    breakdown_by_mode,
  };
};

export const fetchFleetVehicles = async () => clone(vehicles);

export const fetchFleetHealth = async () => {
  const total = vehicles.length;
  const armada_aktif = vehicles.filter(v => v.status_armada === 'Aktif').length;
  const perlu_perawatan = vehicles.filter(v => v.kondisi === 'Perlu Perawatan').length;
  const perlu_peremajaan = vehicles.filter(v => v.kondisi === 'Perlu Peremajaan').length;
  const kondisi_baik = vehicles.filter(v => v.kondisi === 'Baik').length;
  const yearMap = {};
  vehicles.forEach(v => { yearMap[v.year] = (yearMap[v.year] || 0) + 1; });
  const by_mode = {};
  vehicles.forEach(v => {
    if (!by_mode[v.mode]) by_mode[v.mode] = { total: 0, baik: 0, perawatan: 0, peremajaan: 0 };
    by_mode[v.mode].total += 1;
    if (v.kondisi === 'Baik') by_mode[v.mode].baik += 1;
    else if (v.kondisi === 'Perlu Perawatan') by_mode[v.mode].perawatan += 1;
    else by_mode[v.mode].peremajaan += 1;
  });
  return {
    total_armada: total,
    armada_aktif,
    perlu_perawatan,
    perlu_peremajaan,
    kondisi_baik,
    avg_age_years: Math.round(vehicles.reduce((s, v) => s + (2026 - v.year), 0) / Math.max(1, total) * 10) / 10,
    year_distribution: Object.entries(yearMap).map(([year, count]) => ({ year: Number(year), count })).sort((a, b) => a.year - b.year),
    by_mode,
    modernization_target_year: 2015,
  };
};

const priorityScore = v => (2026 - v.year) * 10 + (v.operational_status === 'perawatan' ? 5 : 0);

export const fetchRenewalPlan = async () => {
  const candidates = vehicles.filter(v => v.kondisi === 'Perlu Peremajaan').sort((a, b) => priorityScore(b) - priorityScore(a));
  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map(quarter => ({ quarter, target_units: 0, budget_estimate: 0, co2_reduction_kg_year: 0, approved: 0, rejected: 0, units: [] }));
  candidates.forEach((v, idx) => {
    const q = quarters[idx % 4];
    const item = {
      unit_id: v.id, jenis: v.jenis, route_code: v.route_code, route_name: v.route_name, mode: v.mode, color: v.color,
      year: v.year, age: 2026 - v.year,
      priority: priorityScore(v) >= 130 ? 'Tinggi' : priorityScore(v) >= 100 ? 'Sedang' : 'Normal',
      estimated_cost: v.replacement_cost,
      co2_reduction_kg_year: Math.max(0, v.co2_kg_per_year - (CO2_BASELINE[v.mode] || 3000)),
      approval_status: approvalState[v.id] || 'menunggu',
    };
    q.units.push(item); q.target_units += 1; q.budget_estimate += item.estimated_cost; q.co2_reduction_kg_year += item.co2_reduction_kg_year;
    if (item.approval_status === 'disetujui') q.approved += 1;
    if (item.approval_status === 'ditolak') q.rejected += 1;
  });
  const totalApproved = quarters.reduce((s, q) => s + q.approved, 0);
  return {
    quarters,
    total_units: candidates.length,
    total_budget: quarters.reduce((s, q) => s + q.budget_estimate, 0),
    total_approved: totalApproved,
    total_co2_reduction: quarters.reduce((s, q) => s + q.co2_reduction_kg_year, 0),
    approval_progress_pct: Math.round(totalApproved / Math.max(1, candidates.length) * 1000) / 10,
  };
};

export const approveRenewal = async (unit_id, status) => {
  if (!['disetujui', 'ditolak', 'menunggu'].includes(status)) throw new Error('Status tidak valid');
  if (!vehicles.some(v => v.id === unit_id)) throw new Error('Unit tidak ditemukan');
  approvalState[unit_id] = status;
  return { unit_id, status, message: `Unit ${unit_id} berhasil diperbarui` };
};

export const fetchServiceAlerts = async () => {
  const alerts = vehicles.filter(v => v.km_since_service >= v.next_service_km * 0.85).map(v => {
    const overshoot = v.km_since_service - v.next_service_km;
    let severity = 'low'; let label = 'Mendekati Servis';
    if (overshoot > 3000) { severity = 'critical'; label = 'Servis Telat Kritis'; }
    else if (overshoot > 0) { severity = 'high'; label = 'Servis Terlewat'; }
    else if (overshoot > -1500) { severity = 'medium'; label = 'Servis Segera'; }
    return { vehicle_id: v.id, route_code: v.route_code, route_name: v.route_name, mode: v.mode, color: v.color, km_since_service: v.km_since_service, km_threshold: v.next_service_km, km_overshoot: overshoot, severity, label, mileage_total: v.mileage_km, kondisi: v.kondisi };
  }).sort((a, b) => b.km_overshoot - a.km_overshoot);
  const by_severity = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.forEach(a => { by_severity[a.severity] += 1; });
  return { total_alerts: alerts.length, by_severity, alerts };
};

export const fetchEmissions = async () => {
  const total = vehicles.reduce((s, v) => s + v.co2_kg_per_year, 0);
  const top_offenders = [...vehicles].sort((a, b) => b.co2_kg_per_year - a.co2_kg_per_year).slice(0, 15).map(v => ({
    id: v.id, route_code: v.route_code, year: v.year, age: 2026 - v.year, mode: v.mode, color: v.color, jenis: v.jenis,
    co2_kg_per_year: v.co2_kg_per_year, baseline_kg: CO2_BASELINE[v.mode] || 3000,
    excess_kg: v.co2_kg_per_year - (CO2_BASELINE[v.mode] || 3000),
  }));
  const by_age_bracket = { '< 5 tahun': 0, '5-9 tahun': 0, '10-14 tahun': 0, '≥ 15 tahun': 0 };
  vehicles.forEach(v => {
    const age = 2026 - v.year;
    const key = age < 5 ? '< 5 tahun' : age < 10 ? '5-9 tahun' : age < 15 ? '10-14 tahun' : '≥ 15 tahun';
    by_age_bracket[key] += v.co2_kg_per_year;
  });
  const saving = vehicles.filter(v => v.kondisi === 'Perlu Peremajaan').reduce((s, v) => s + Math.max(0, v.co2_kg_per_year - (CO2_BASELINE[v.mode] || 3000)), 0);
  return { total_co2_kg_year: total, total_co2_tons_year: Math.round(total / 100) / 10, avg_per_unit_kg: Math.round(total / Math.max(1, vehicles.length)), top_offenders, by_age_bracket, peremajaan_saving_kg_year: saving, trees_equivalent: Math.round(saving / 21) };
};

export const fleetReportUrl = () => '#';

const walkLeg = (from_stop, to_stop, minutes, meters) => ({ mode: 'walk', route_code: 'JALAN', route_name: 'Jalan Kaki', from_stop, to_stop, duration_min: minutes, fare: 0, distance_m: meters, color: '#64748B', instruction: `Jalan ${meters} m menuju ${to_stop}` });
const rideLeg = (mode, code, name, from_stop, to_stop, minutes, fare, stops, color, headway) => ({ mode, route_code: code, route_name: name, from_stop, to_stop, duration_min: minutes, fare, num_stops: stops, color, headway_min: headway, instruction: `Naik ${name}, turun di ${to_stop} setelah ${stops} halte` });

const nearestHub = text => {
  const t = text.toLowerCase();
  if (['stasiun', 'kereta', 'kota baru'].some(k => t.includes(k))) return ['Stasiun Malang Kota Baru', -7.9776, 112.6376];
  if (t.includes('arjosari')) return ['Terminal Arjosari', -7.9186, 112.6540];
  if (['landungsari', 'brawijaya', 'ub', 'umm', 'unisma', 'dinoyo'].some(k => t.includes(k))) return ['Terminal Landungsari', -7.9312, 112.5924];
  if (['gadang', 'kepanjen', 'sukun'].some(k => t.includes(k))) return ['Terminal Gadang', -8.0246, 112.6291];
  if (['alun', 'kayutangan', 'matos', 'town square'].some(k => t.includes(k))) return ['Halte Alun-Alun', -7.9832, 112.6320];
  return ['Halte Terdekat', -7.9666, 112.6326];
};

export const searchRoutes = async ({ origin, destination }) => {
  if (!origin?.trim() || !destination?.trim()) throw new Error('Isi asal dan tujuan');
  const o = origin.trim(); const d = destination.trim();
  const oh = nearestHub(o); const dh = nearestHub(d);
  const options = [
    { id: 'opt-fastest', label: 'Tercepat', total_duration_min: 38, total_fare: 13000, transfers: 1, walking_min: 7, walking_m: 520, co2_saved_kg: 2.4, departure_time: '14:05', arrival_time: '14:43', legs: [walkLeg(o, `Halte dekat ${oh[0]}`, 3, 220), rideLeg('angkot', 'ADL', 'Angkot ADL (Arjosari - Dinoyo - Landungsari)', `Halte ${oh[0]}`, 'Transit Hub Dinoyo', 16, 5000, 9, '#D97706', 8), walkLeg('Transit Hub Dinoyo', 'Halte Trans Jatim Dinoyo', 2, 140), rideLeg('trans_jatim', 'TJ-K1', 'Trans Jatim Koridor 1', 'Halte Trans Jatim Dinoyo', dh[0], 14, 8000, 4, '#0284C7', 20), walkLeg(dh[0], d, 3, 160)] },
    { id: 'opt-cheapest', label: 'Termurah', total_duration_min: 52, total_fare: 5000, transfers: 1, walking_min: 12, walking_m: 890, co2_saved_kg: 2.1, departure_time: '14:05', arrival_time: '14:57', legs: [walkLeg(o, `Halte ${oh[0]}`, 5, 340), rideLeg('angkot', 'AL', 'Angkot AL (Arjosari - Landungsari)', `Halte ${oh[0]}`, 'Halte Kayutangan', 18, 5000, 10, '#D97706', 8), walkLeg('Halte Kayutangan', 'Halte Sudirman', 4, 280), rideLeg('angkot', 'GL', 'Angkot GL (Gadang - Landungsari)', 'Halte Sudirman', dh[0], 22, 0, 12, '#D97706', 9), walkLeg(dh[0], d, 3, 270)] },
    { id: 'opt-notransfer', label: 'Minim Transfer', total_duration_min: 45, total_fare: 5000, transfers: 0, walking_min: 14, walking_m: 980, co2_saved_kg: 1.9, departure_time: '14:05', arrival_time: '14:50', legs: [walkLeg(o, `Halte ${oh[0]}`, 7, 480), rideLeg('angkot', 'GA', 'Angkot GA (Gadang - Arjosari)', `Halte ${oh[0]}`, dh[0], 31, 5000, 16, '#D97706', 9), walkLeg(dh[0], d, 7, 500)] },
    { id: 'opt-comfort', label: 'Paling Nyaman', total_duration_min: 58, total_fare: 20000, transfers: 1, walking_min: 5, walking_m: 380, co2_saved_kg: 3.2, departure_time: '14:05', arrival_time: '15:03', legs: [walkLeg(o, 'Stasiun Malang Kota Baru', 3, 210), rideLeg('kereta', 'KAI-KPN', 'KA Lokal Malang - Kepanjen', 'Stasiun Malang Kota Baru', 'Stasiun Malang Kota Lama', 22, 8000, 3, '#1E3A8A', 90), walkLeg('Stasiun Malang Kota Lama', 'Halte Bus Kota Lama', 2, 170), rideLeg('bus', 'BUS-BLT', 'Bus AKDP Malang - Blitar (Local)', 'Halte Bus Kota Lama', dh[0], 28, 12000, 5, '#059669', 45), walkLeg(dh[0], d, 3, 0)] },
  ];
  return { origin: o, destination: d, origin_hub: oh[0], destination_hub: dh[0], options };
};

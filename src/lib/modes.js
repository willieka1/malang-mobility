// Malang Mobility - Transport mode design tokens
export const MODES = {
  angkot: {
    key: 'angkot',
    label: 'Angkot',
    fullLabel: 'Angkutan Kota',
    primary: '#D97706',
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FCD34D',
  },
  trans_jatim: {
    key: 'trans_jatim',
    label: 'Trans Jatim',
    fullLabel: 'Trans Jatim BRT',
    primary: '#0284C7',
    bg: '#E0F2FE',
    text: '#075985',
    border: '#7DD3FC',
  },
  kereta: {
    key: 'kereta',
    label: 'Kereta',
    fullLabel: 'Kereta Api',
    primary: '#1E3A8A',
    bg: '#EEF2FF',
    text: '#1E40AF',
    border: '#A5B4FC',
  },
  bus: {
    key: 'bus',
    label: 'Bus',
    fullLabel: 'Bus Antarkota',
    primary: '#059669',
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#6EE7B7',
  },
  walk: {
    key: 'walk',
    label: 'Jalan Kaki',
    fullLabel: 'Jalan Kaki',
    primary: '#64748B',
    bg: '#F1F5F9',
    text: '#334155',
    border: '#CBD5E1',
  },
};

export const STATUS = {
  tepat_waktu: { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E', label: 'Tepat Waktu' },
  padat: { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B', label: 'Padat' },
  terlambat: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444', label: 'Terlambat' },
  perawatan: { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: 'Perawatan' },
};

export const getMode = (key) => MODES[key] || MODES.walk;

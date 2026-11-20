export const PROVENANCE_LABELS = {
  local: 'Kuliner Khas Rembang',
  adaptation: 'Resep Adaptasi',
  general: 'Resep Umum',
};

export const CATEGORIES = ['Makanan Berat', 'Jajanan Tradisional', 'Minuman'];

export const PROVENANCE_OPTIONS = [
  { value: 'local', label: PROVENANCE_LABELS.local },
  { value: 'adaptation', label: PROVENANCE_LABELS.adaptation },
  { value: 'general', label: PROVENANCE_LABELS.general },
];

export const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit'];

export const VERIFICATION_LABELS = {
  verified: 'Terverifikasi',
  unverified: 'Belum terverifikasi',
};

export const SUBMISSION_TYPES = [
  { value: 'food-suggestion', label: 'Usulan makanan' },
  { value: 'story', label: 'Cerita budaya' },
  { value: 'recipe', label: 'Kontribusi resep' },
  { value: 'photo', label: 'Dokumentasi foto' },
];

export const SUBMISSION_STATUS_LABELS = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export const NAV_LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/jelajah', label: 'Jelajah Rasa' },
  { to: '/peta', label: 'Peta Gastronomi' },
  { to: '/cerita', label: 'Cerita & Budaya' },
  { to: '/glosarium', label: 'Glosarium' },
  { to: '/kontribusi', label: 'Kontribusi' },
];

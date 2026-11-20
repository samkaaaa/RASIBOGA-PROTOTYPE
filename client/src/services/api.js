import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 25000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = data?.message;
    if (!message && error.code === 'ECONNABORTED') message = 'Permintaan melebihi batas waktu.';
    if (!message && !error.response) {
      message = 'Tidak dapat terhubung ke server RASIBOGA. Pastikan API sedang berjalan.';
    }
    if (!message) message = 'Terjadi kesalahan. Silakan coba lagi.';

    const normalised = new Error(message);
    normalised.status = status;
    normalised.details = data?.details;
    normalised.original = error;
    return Promise.reject(normalised);
  }
);

/** Unwrap the standard `{ success, data, meta }` envelope. */
export async function getData(path, config) {
  const response = await api.get(path, config);
  return { data: response.data.data, meta: response.data.meta };
}

/**
 * Resolve a media path returned by the API.
 * `/uploads/...` is proxied in development; in production the API lives on a
 * different origin, so the API origin is prepended.
 */
export function mediaUrl(url) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads') && /^https?:\/\//i.test(API_BASE)) {
    const origin = new URL(API_BASE).origin;
    return `${origin}${url}`;
  }
  return url;
}

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data.data),
};

export const adminApi = {
  stats: () => api.get('/admin/stats').then((res) => res.data.data),
  settings: () => api.get('/admin/settings').then((res) => res.data.data),
};

export default api;

/**
 * YouTube helpers.
 * Admins submit a URL (never raw iframe HTML). We validate the host and
 * build the embed URL ourselves so arbitrary markup can never be injected.
 */

const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** @returns {string|null} the 11 character video id */
export function extractYouTubeId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (!HOSTS.has(url.hostname.toLowerCase())) return null;

  let id = null;

  if (url.hostname.includes('youtu.be')) {
    id = url.pathname.split('/').filter(Boolean)[0] || null;
  } else if (url.pathname === '/watch') {
    id = url.searchParams.get('v');
  } else {
    const parts = url.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) id = parts[1] || null;
  }

  return id && ID_PATTERN.test(id) ? id : null;
}

export function buildYouTubeEmbed(rawUrl) {
  const id = extractYouTubeId(rawUrl);
  if (!id) return null;
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  };
}

export function isYouTubeUrl(rawUrl) {
  return Boolean(extractYouTubeId(rawUrl));
}

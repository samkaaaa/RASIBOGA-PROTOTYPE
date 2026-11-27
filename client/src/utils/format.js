export function formatMinutes(value) {
  const minutes = Number(value) || 0;
  if (minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} jam ${rest} mnt` : `${hours} jam`;
}

export function formatSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
}

export function totalTime(recipe) {
  if (!recipe) return 0;
  return (Number(recipe.preparationTime) || 0) + (Number(recipe.cookingTime) || 0);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

const IMAGE_BLOCK_PATTERN = /^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)$/;

const isSafeImageSrc = (src) => /^(https?:\/\/|\/(?!\/))/i.test(src);

/**
 * Counts standalone archive photo lines so editors can enforce an image limit.
 */
export function countImageBlocks(content = '') {
  return String(content)
    .split(/\r?\n/)
    .filter((line) => {
      const match = line.trim().match(IMAGE_BLOCK_PATTERN);
      return Boolean(match && isSafeImageSrc(match[2]));
    }).length;
}

/**
 * Simple markdown-lite renderer used for article content (no raw HTML).
 * Supports an archive photo line: ![alt](url "caption") or ![caption](url).
 */
export function parseArticleContent(content = '') {
  const lines = String(content).split(/\r?\n/);
  const blocks = [];
  let list = null;

  const inline = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      list = null;
      continue;
    }

    const imageMatch = line.match(IMAGE_BLOCK_PATTERN);
    if (imageMatch && isSafeImageSrc(imageMatch[2])) {
      list = null;
      blocks.push({
        type: 'image',
        src: imageMatch[2],
        caption: (imageMatch[3] || imageMatch[1] || '').trim(),
      });
      continue;
    }

    if (line.startsWith('### ')) {
      list = null;
      blocks.push({ type: 'h3', html: inline(line.slice(4)) });
      continue;
    }
    if (line.startsWith('## ')) {
      list = null;
      blocks.push({ type: 'h2', html: inline(line.slice(3)) });
      continue;
    }
    if (/^[-*] /.test(line)) {
      if (!list) {
        list = { type: 'ul', items: [] };
        blocks.push(list);
      }
      list.items.push(inline(line.slice(2)));
      continue;
    }
    if (/^\d+\. /.test(line)) {
      if (!list) {
        list = { type: 'ol', items: [] };
        blocks.push(list);
      }
      list.items.push(inline(line.replace(/^\d+\. /, '')));
      continue;
    }

    list = null;
    blocks.push({ type: 'p', html: inline(line) });
  }

  return blocks;
}

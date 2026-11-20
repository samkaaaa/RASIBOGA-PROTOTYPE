/**
 * Generates the EXAMPLE visual assets used by RASIBOGA.
 *
 *   node tools/generate-placeholders.mjs
 *
 * Everything is plain SVG so it can be opened in Figma / Illustrator / a text
 * editor and replaced later. Replace the files in client/public/assets with
 * real photography (JPG/WEBP) and update the `url` fields in the admin
 * dashboard — no code changes required.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'client', 'public', 'assets');

const RED = '#B8232F';
const RED_DARK = '#8E1A24';
const CREAM = '#FDEFE3';
const IVORY = '#FFFAF5';
const BROWN = '#2E1F1B';
const PINK = '#F0BFD0';
const GREEN = '#3F6B55';
const GREEN_SOFT = '#E4EFE9';
const BORDER = '#EBD9CB';
const MUTED = '#7A6258';

const BRICK = RED;
const TEAL = GREEN;
const COCOA = BROWN;

const palettes = [
  { bg: '#FDEFE3', mid: '#F6DCCB', accent: RED },
  { bg: '#FFFAF5', mid: '#F5E3D3', accent: GREEN },
  { bg: '#FDEFE3', mid: '#F0BFD0', accent: RED_DARK },
  { bg: '#E4EFE9', mid: '#F5E7DB', accent: GREEN },
  { bg: '#FFFAF5', mid: '#F3D9C8', accent: RED },
  { bg: '#F7E8DA', mid: '#EBD9CB', accent: BROWN },
];

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 9973;
  return h;
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
}

function wrap(text, max = 16) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Food image placeholder (4:3)                                        */
/* ------------------------------------------------------------------ */
function foodSvg(name, seed) {
  const p = palettes[hash(seed) % palettes.length];
  const lines = wrap(name, 18);
  const fontSize = lines.length > 2 ? 44 : 54;
  const startY = 470 - (lines.length - 1) * 26;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Ilustrasi contoh untuk ${escapeXml(name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg}"/>
      <stop offset="1" stop-color="${p.mid}"/>
    </linearGradient>
    <radialGradient id="plate" cx="50%" cy="42%" r="52%">
      <stop offset="0" stop-color="#FFF7F2"/>
      <stop offset="0.7" stop-color="${CREAM}"/>
      <stop offset="1" stop-color="${PINK}"/>
    </radialGradient>
  </defs>

  <rect width="800" height="600" fill="url(#bg)"/>
  <g opacity="0.3" stroke="${PINK}" stroke-width="1.4" fill="none">
    <circle cx="400" cy="270" r="110"/>
    <circle cx="400" cy="270" r="165"/>
    <circle cx="400" cy="270" r="220"/>
  </g>

  <ellipse cx="400" cy="470" rx="235" ry="34" fill="${BROWN}" opacity="0.15"/>
  <circle cx="400" cy="268" r="176" fill="url(#plate)" stroke="${BORDER}" stroke-width="2"/>

  <g fill="${p.accent}" opacity="0.9">
    <path d="M400 190c26 20 38 44 34 70-30-4-52-22-60-50 8-8 16-14 26-20z"/>
    <path d="M336 214c-6 30 4 54 26 70 16-24 16-50 0-74-10 0-18 1-26 4z" opacity="0.65"/>
    <path d="M464 226c10 26 4 50-16 68-14-24-12-48 4-70 4 0 8 1 12 2z" opacity="0.5"/>
  </g>
  <g stroke="${COCOA}" stroke-width="3" stroke-linecap="round" opacity="0.35" fill="none">
    <path d="M376 176c-14-16 10-26-2-42"/>
    <path d="M404 168c-12-18 12-28 0-46"/>
    <path d="M432 176c-10-14 8-24-2-38"/>
  </g>

  <g font-family="Playfair Display, Georgia, serif" text-anchor="middle">
    ${lines
      .map(
        (line, index) =>
          `<text x="400" y="${startY + index * (fontSize + 8)}" font-size="${fontSize}" fill="${COCOA}">${escapeXml(line)}</text>`
      )
      .join('\n    ')}
  </g>
  <text x="400" y="552" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="13" letter-spacing="5" fill="${p.accent}" text-anchor="middle" opacity="0.75">CONTOH GAMBAR</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Ingredient placeholder (1:1)                                        */
/* ------------------------------------------------------------------ */
function ingredientSvg(name, seed) {
  const p = palettes[hash(seed) % palettes.length];
  const lines = wrap(name, 13);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="Ilustrasi contoh bahan ${escapeXml(name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg}"/>
      <stop offset="1" stop-color="${p.mid}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="255" r="150" fill="#FFFCF7" opacity="0.55"/>
  <circle cx="300" cy="255" r="150" fill="none" stroke="${p.accent}" stroke-opacity="0.3" stroke-width="2"/>
  <g fill="${p.accent}" opacity="0.85">
    <path d="M300 160c40 30 58 66 52 106-46-6-80-34-92-76 12-12 25-22 40-30z"/>
    <path d="M240 196c-12 44 6 82 40 108 24-36 24-78 0-114-14 1-28 3-40 6z" opacity="0.6"/>
  </g>
  <g font-family="Playfair Display, Georgia, serif" text-anchor="middle">
    ${lines
      .map((line, index) => `<text x="300" y="${430 + index * 40}" font-size="34" fill="${COCOA}">${escapeXml(line)}</text>`)
      .join('\n    ')}
  </g>
  <text x="300" y="548" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="11" letter-spacing="4" fill="${p.accent}" text-anchor="middle" opacity="0.7">CONTOH BAHAN</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Brand assets                                                        */
/* ------------------------------------------------------------------ */
const foodPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Gambar belum tersedia">
  <rect width="800" height="600" fill="${CREAM}"/>
  <g opacity="0.3" stroke="${PINK}" fill="none" stroke-width="1.4">
    <circle cx="400" cy="270" r="120"/>
    <circle cx="400" cy="270" r="170"/>
    <circle cx="400" cy="270" r="220"/>
  </g>
  <g fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round" opacity="0.55">
    <path d="M400 210v90M370 245l30-35 30 35"/>
  </g>
  <text x="400" y="420" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-size="30" fill="${BROWN}" opacity="0.7">Gambar belum tersedia</text>
  <text x="400" y="456" text-anchor="middle" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="12" letter-spacing="4" fill="${GREEN}">RASIBOGA</text>
</svg>`;

const ingredientPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="Gambar bahan belum tersedia">
  <rect width="600" height="600" fill="${GREEN_SOFT}"/>
  <g opacity="0.3" stroke="${GREEN}" fill="none" stroke-width="1.4">
    <circle cx="300" cy="255" r="90"/>
    <circle cx="300" cy="255" r="130"/>
    <circle cx="300" cy="255" r="170"/>
  </g>
  <g fill="none" stroke="${GREEN}" stroke-width="5" stroke-linecap="round" opacity="0.55">
    <path d="M300 210v72M270 240l30-30 30 30"/>
  </g>
  <text x="300" y="420" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-size="26" fill="${BROWN}" opacity="0.7">Gambar bahan belum tersedia</text>
  <text x="300" y="456" text-anchor="middle" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="11" letter-spacing="4" fill="${GREEN}">RASIBOGA</text>
</svg>`;

const logoMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Logo RASIBOGA">
  <rect width="96" height="96" rx="24" fill="${BRICK}"/>
  <g fill="none" stroke="${CREAM}" stroke-width="4" stroke-linecap="round">
    <path d="M30 62c0-16 8-30 18-38 10 8 18 22 18 38"/>
    <path d="M48 24v44"/>
    <path d="M38 40c6 2 10 6 10 12-6-1-10-5-10-12z" fill="${CREAM}" stroke="none"/>
    <path d="M58 40c-6 2-10 6-10 12 6-1 10-5 10-12z" fill="${CREAM}" stroke="none" opacity="0.75"/>
  </g>
  <path d="M28 66h40" stroke="${CREAM}" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const logoWordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 96" role="img" aria-label="RASIBOGA">
  <rect width="380" height="96" fill="none"/>
  <g transform="translate(4 4)">
    <rect width="88" height="88" rx="22" fill="${BRICK}"/>
    <g fill="none" stroke="${IVORY}" stroke-width="3.6" stroke-linecap="round">
      <path d="M28 58c0-15 7-28 16-35 9 7 16 20 16 35"/>
      <path d="M44 23v41"/>
      <path d="M35 38c5 2 9 5 9 11-5-1-9-5-9-11z" fill="${IVORY}" stroke="none"/>
      <path d="M53 38c-5 2-9 5-9 11 5-1 9-5 9-11z" fill="${IVORY}" stroke="none" opacity="0.75"/>
    </g>
    <path d="M26 62h36" stroke="${IVORY}" stroke-width="3.6" stroke-linecap="round"/>
  </g>
  <text x="112" y="52" font-family="Playfair Display, Georgia, serif" font-size="38" letter-spacing="3" fill="${COCOA}">RASIBOGA</text>
  <text x="114" y="74" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="10.5" letter-spacing="3.2" fill="${TEAL}">WARISAN RASA REMBANG</text>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="24" fill="${BRICK}"/>
  <g fill="none" stroke="${CREAM}" stroke-width="4" stroke-linecap="round">
    <path d="M30 62c0-16 8-30 18-38 10 8 18 22 18 38"/>
    <path d="M48 24v44"/>
  </g>
  <path d="M28 66h40" stroke="${CREAM}" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <circle cx="1010" cy="120" r="260" fill="${BRICK}" opacity="0.07"/>
  <circle cx="1080" cy="520" r="200" fill="${TEAL}" opacity="0.08"/>
  <g transform="translate(90 150)">
    <rect width="120" height="120" rx="30" fill="${BRICK}"/>
    <g fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round">
      <path d="M38 80c0-20 10-38 22-48 12 10 22 28 22 48"/>
      <path d="M60 32v54"/>
    </g>
    <text x="0" y="200" font-family="Playfair Display, Georgia, serif" font-size="86" letter-spacing="6" fill="${COCOA}">RASIBOGA</text>
    <text x="4" y="256" font-family="Playfair Display, Georgia, serif" font-size="32" fill="${TEAL}">Digital Culinary Heritage of Rembang</text>
    <text x="4" y="316" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="17" letter-spacing="2" fill="${COCOA}" opacity="0.7">MAKANAN · RESEP · PETA GASTRONOMI · CERITA BUDAYA</text>
  </g>
</svg>`;

const pattern = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <g fill="none" stroke="${BRICK}" stroke-width="1" opacity="0.16">
    <path d="M60 10c14 14 22 30 22 50s-8 36-22 50c-14-14-22-30-22-50s8-36 22-50z"/>
    <circle cx="60" cy="60" r="8"/>
    <path d="M0 60h24M96 60h24M60 0v14M60 106v14"/>
  </g>
</svg>`;

const videoPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-label="Contoh thumbnail video">
  <rect width="800" height="450" fill="${COCOA}"/>
  <g opacity="0.2" stroke="${CREAM}" fill="none" stroke-width="1.2">
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="400" cy="225" r="${60 + i * 40}"/>`).join('\n    ')}
  </g>
  <circle cx="400" cy="205" r="54" fill="${BRICK}"/>
  <path d="M388 182l34 23-34 23z" fill="${CREAM}"/>
  <text x="400" y="315" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-size="30" fill="${CREAM}">Slot video contoh</text>
  <text x="400" y="350" text-anchor="middle" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="12" letter-spacing="4" fill="${CREAM}" opacity="0.6">GANTI MELALUI DASHBOARD ADMIN</text>
</svg>`;

const mapPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Ilustrasi peta contoh">
  <rect width="800" height="500" fill="${GREEN_SOFT}"/>
  <g stroke="${BORDER}" stroke-width="2" fill="none">
    ${Array.from({ length: 10 }, (_, i) => `<path d="M-40 ${40 + i * 52}C180 ${10 + i * 55} 420 ${90 + i * 48} 840 ${30 + i * 52}"/>`).join('\n    ')}
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${60 + i * 130} -20C${40 + i * 135} 160 ${120 + i * 120} 340 ${70 + i * 130} 520"/>`).join('\n    ')}
  </g>
  <path d="M0 330C160 300 240 360 360 330s240-90 440-40v210H0z" fill="${TEAL}" opacity="0.10"/>
  <g>
    <circle cx="300" cy="230" r="14" fill="${BRICK}"/>
    <circle cx="300" cy="230" r="26" fill="${BRICK}" opacity="0.2"/>
    <circle cx="480" cy="300" r="12" fill="${TEAL}"/>
    <circle cx="480" cy="300" r="24" fill="${TEAL}" opacity="0.2"/>
    <circle cx="380" cy="180" r="10" fill="${COCOA}" opacity="0.6"/>
  </g>
  <text x="400" y="452" text-anchor="middle" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="13" letter-spacing="4" fill="${COCOA}" opacity="0.55">PETA CONTOH — TITIK PERLU DIVERIFIKASI</text>
</svg>`;

const articleCover = (index) => {
  const p = palettes[(index + 1) % palettes.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="Ilustrasi artikel contoh">
  <defs><linearGradient id="a${index}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.mid}"/></linearGradient></defs>
  <rect width="1200" height="675" fill="url(#a${index})"/>
  <g opacity="0.4" stroke="${p.accent}" fill="none" stroke-width="1.5">
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="880" cy="330" r="${80 + i * 46}" opacity="${0.45 - i * 0.05}"/>`).join('\n    ')}
  </g>
  <g fill="${p.accent}" opacity="0.5">
    <path d="M300 420c60-60 130-90 210-90-10 84-60 150-150 180-30-26-50-56-60-90z"/>
    <path d="M240 300c20-70 70-120 150-150 14 80-16 150-90 200-24-14-44-30-60-50z" opacity="0.6"/>
  </g>
  <text x="120" y="560" font-family="Playfair Display, Georgia, serif" font-size="40" fill="${COCOA}" opacity="0.75">RASIBOGA · CATATAN BUDAYA</text>
  <text x="120" y="606" font-family="Plus Jakarta Sans, Verdana, sans-serif" font-size="14" letter-spacing="5" fill="${p.accent}" opacity="0.7">CONTOH GAMBAR</text>
</svg>`;
};

/* ------------------------------------------------------------------ */
async function main() {
  const dirs = ['foods', 'ingredients', 'articles', 'videos'].map((dir) => path.join(assets, dir));
  await Promise.all(dirs.map((dir) => fs.mkdir(dir, { recursive: true })));

  await fs.writeFile(path.join(assets, 'logo-rasiboga.svg'), logoWordmark);
  await fs.writeFile(path.join(assets, 'logo-mark.svg'), logoMark);
  await fs.writeFile(path.join(assets, 'favicon.svg'), favicon);
  await fs.writeFile(path.join(assets, 'og-image.svg'), ogImage);
  await fs.writeFile(path.join(assets, 'pattern.svg'), pattern);
  await fs.writeFile(path.join(assets, 'map-placeholder.svg'), mapPlaceholder);
  await fs.writeFile(path.join(assets, 'food-placeholder.svg'), foodPlaceholder);
  await fs.writeFile(path.join(assets, 'ingredients', 'placeholder.svg'), ingredientPlaceholder);
  await fs.writeFile(path.join(assets, 'videos', 'video-placeholder.svg'), videoPlaceholder);

  const { foodsSeed, ingredientsSeed } = await import(
    pathToFileURL(path.join(root, 'server', 'data', 'seedData.js')).href
  );

  for (const food of foodsSeed) {
    await fs.writeFile(path.join(assets, 'foods', `${food.slug}.svg`), foodSvg(food.name, food.slug));
  }
  for (const ingredient of ingredientsSeed) {
    await fs.writeFile(
      path.join(assets, 'ingredients', `${ingredient.key}.svg`),
      ingredientSvg(ingredient.name, ingredient.key)
    );
  }
  for (let i = 1; i <= 3; i += 1) {
    await fs.writeFile(path.join(assets, 'articles', `article-${i}.svg`), articleCover(i));
  }

  console.log(`Assets written to ${assets}`);
  console.log(`  ${foodsSeed.length} food placeholders, ${ingredientsSeed.length} ingredient placeholders, 3 article covers`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

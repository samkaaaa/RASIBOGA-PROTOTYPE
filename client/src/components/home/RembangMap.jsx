import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

const FALLBACK_POSITIONS = [
  { x: 28, y: 36 },
  { x: 53, y: 29 },
  { x: 69, y: 52 },
  { x: 43, y: 70 },
  { x: 60, y: 68 },
];

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildDistrictData(markers = [], districtNames = []) {
  const names = [
    ...new Set([
      ...districtNames.filter(Boolean),
      ...markers.map((marker) => marker.location?.district).filter(Boolean),
    ]),
  ];

  const grouped = new Map(
    names.map((name) => [name, { name, count: 0, lats: [], lngs: [] }])
  );

  markers.forEach((marker) => {
    const name = marker.location?.district || 'Rembang';
    if (!grouped.has(name)) grouped.set(name, { name, count: 0, lats: [], lngs: [] });
    const entry = grouped.get(name);
    entry.count += 1;

    const lat = marker.location?.coordinates?.lat;
    const lng = marker.location?.coordinates?.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      entry.lats.push(lat);
      entry.lngs.push(lng);
    }
  });

  return [...grouped.values()].map((entry) => ({
    name: entry.name,
    count: entry.count,
    lat: average(entry.lats),
    lng: average(entry.lngs),
  }));
}

/**
 * Lightweight editorial map of Rembang. It uses an inline SVG base instead of
 * remote tiles, then places accessible HTML pins over it. Districts without
 * coordinates fall back to deterministic positions so the map is never empty.
 */
export default function RembangMap({
  markers = [],
  districtNames = [],
  activeDistrict,
  onSelect,
  height = 420,
}) {
  const districts = useMemo(
    () => buildDistrictData(markers, districtNames),
    [markers, districtNames]
  );

  const pins = useMemo(() => {
    const withCoordinates = districts.filter(
      (district) => Number.isFinite(district.lat) && Number.isFinite(district.lng)
    );

    if (!withCoordinates.length) {
      return districts.map((district, index) => ({
        ...district,
        x: FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length].x,
        y: FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length].y,
        projected: false,
      }));
    }

    const lats = withCoordinates.map((district) => district.lat);
    const lngs = withCoordinates.map((district) => district.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(maxLat - minLat, 0.06);
    const lngSpan = Math.max(maxLng - minLng, 0.06);
    const padLat = latSpan * 0.2;
    const padLng = lngSpan * 0.2;

    return districts.map((district, index) => {
      if (!Number.isFinite(district.lat) || !Number.isFinite(district.lng)) {
        const fallback = FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length];
        return { ...district, x: fallback.x, y: fallback.y, projected: false };
      }

      const x = 9 + ((district.lng - (minLng - padLng)) / (lngSpan + padLng * 2)) * 82;
      const y = 12 + (((maxLat + padLat) - district.lat) / (latSpan + padLat * 2)) * 74;
      return { ...district, x, y, projected: true };
    });
  }, [districts]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-line bg-cream-deep shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)]"
      style={{ height }}
    >
      <svg
        viewBox="0 0 600 420"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Peta ilustratif Kabupaten Rembang dengan titik kecamatan"
      >
        <defs>
          <linearGradient id="rasa-map-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4EFE9" />
            <stop offset="100%" stopColor="#F9E4D2" />
          </linearGradient>
          <pattern id="rasa-map-grid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M38 0H0V38" fill="none" stroke="#EBD9CB" strokeWidth="1" opacity="0.6" />
          </pattern>
        </defs>

        <rect width="600" height="420" fill="#FDF4EA" />
        <rect width="600" height="420" fill="url(#rasa-map-grid)" />

        <path
          d="M78 216C64 152 118 92 204 80c82-12 132 16 200 2 72-14 136 30 132 96-4 66-36 122-106 156-70 34-168 48-242 22-70-24-98-74-110-140Z"
          fill="url(#rasa-map-fill)"
          stroke="#EBD9CB"
          strokeWidth="2.5"
        />
        <path
          d="M100 240c80-14 160 10 240-8 70-16 130-2 182-18"
          fill="none"
          stroke="#B8232F"
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity="0.28"
        />
        <path
          d="M126 178c58-38 120-42 178-20 58 22 116 16 166-8"
          fill="none"
          stroke="#3F6B55"
          strokeWidth="1.5"
          strokeDasharray="3 7"
          opacity="0.3"
        />
        <circle cx="496" cy="120" r="4" fill="#F0BFD0" />
        <circle cx="122" cy="304" r="4" fill="#F0BFD0" />
        <circle cx="438" cy="314" r="3" fill="#B8232F" opacity="0.35" />

        <text
          x="30"
          y="36"
          fill="#7A6258"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="10"
          fontWeight="600"
          letterSpacing="2"
        >
          KABUPATEN REMBANG
        </text>
        <text
          x="30"
          y="52"
          fill="#7A6258"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontSize="9"
          letterSpacing="1.4"
          opacity="0.8"
        >
          JAWA TENGAH
        </text>
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-soft/90 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-cocoa backdrop-blur-sm">
        <MapPin size={12} className="text-brick" />
        Peta kecamatan
      </div>

      {pins.map((pin) => {
        const active = pin.name === activeDistrict;
        return (
          <button
            key={pin.name}
            type="button"
            onClick={() => onSelect?.(pin.name)}
            aria-pressed={active}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center border-0 bg-transparent p-0 outline-none"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span
              className={`relative grid h-9 w-9 place-items-center rounded-full border-2 font-sans text-[11px] font-bold shadow-[0_8px_18px_-8px_rgba(46,31,27,0.45)] transition-all duration-300 sm:h-10 sm:w-10 ${
                active
                  ? 'scale-110 border-cream-soft bg-brick text-cream-soft'
                  : 'border-cream-soft bg-cream-soft text-brick hover:scale-105 hover:bg-pink/40'
              }`}
            >
              {pin.count}
              {active && (
                <span className="absolute inset-0 animate-ping rounded-full bg-brick/25 motion-reduce:animate-none" />
              )}
            </span>
            <span
              className={`mt-1 whitespace-nowrap rounded-full px-2 py-0.5 font-sans text-[9px] font-semibold tracking-wide shadow-[0_4px_10px_-8px_rgba(46,31,27,0.45)] transition-colors ${
                active ? 'bg-brick text-cream-soft' : 'bg-cream-soft/95 text-cocoa-soft'
              }`}
            >
              {pin.name}
            </span>
            <span className="sr-only"> makanan</span>
          </button>
        );
      })}

      {!pins.length && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="max-w-sm rounded-2xl border border-line bg-cream-soft/90 px-5 py-4">
            <p className="font-display text-lg text-cocoa">Titik kecamatan segera hadir</p>
            <p className="mt-1 text-xs leading-relaxed text-cocoa-soft">
              Koordinat sedang dilengkapi bersama pemerintah desa dan pelaku kuliner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

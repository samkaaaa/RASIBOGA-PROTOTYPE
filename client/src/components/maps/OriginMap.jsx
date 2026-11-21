import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOverlay, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BadgeCheck, CircleAlert } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';

const REMBANG_CENTER = [-6.72, 111.42];
const LOCAL_MAP_BOUNDS = [
  [-6.95, 111.15],
  [-6.46, 111.75],
];

const CARTO_TILE_KEY = (import.meta.env.VITE_CARTO_TILE_KEY || '').trim();

// CARTO mengembalikan gambar placeholder bertuliskan "API KEY REQUIRED" dengan
// HTTP 200 jika endpoint dipakai tanpa key. Karena itu CARTO hanya dipakai saat
// key memang tersedia; penyedia utama memakai endpoint yang benar-benar bebas key.
const CARTO_PROVIDER = {
  id: 'carto-voyager',
  url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(
    CARTO_TILE_KEY
  )}`,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    '&copy; <a href="https://carto.com/attribution/">CARTO</a>',
  maxNativeZoom: 19,
  maxZoom: 20,
};

const KEYLESS_TILE_PROVIDERS = [
  {
    id: 'osm-de',
    url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'tiles by <a href="https://www.openstreetmap.de/">OpenStreetMap Deutschland</a>',
    maxNativeZoom: 18,
    maxZoom: 19,
  },
  {
    id: 'opentopomap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | ' +
      'Map style: &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (CC BY-SA)',
    subdomains: 'abc',
    maxNativeZoom: 17,
    maxZoom: 18,
  },
];

const TILE_PROVIDERS = CARTO_TILE_KEY
  ? [CARTO_PROVIDER, ...KEYLESS_TILE_PROVIDERS]
  : KEYLESS_TILE_PROVIDERS;
const TRANSPARENT_TILE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

function makeIcon(color, label) {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div class="rasiboga-marker" style="width:30px;height:30px;background:${color}"><span>${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

function FitToMarkers({ signature, positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 11, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [42, 42], maxZoom: 12, animate: false });
    // signature intentionally drives the effect (positions is a new array each render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  return null;
}

/**
 * Shared Leaflet map for the food-origin and ingredient-origin experiences.
 * Markers are only rendered for locations that actually have coordinates.
 *
 * Marker clustering is intentionally omitted: the MVP dataset is small
 * (~12 markers). Add leaflet.markercluster when the dataset grows.
 */
export default function OriginMap({ markers = [], mode = 'food', height = '520px', className = '' }) {
  const isFood = mode === 'food';

  const safeMarkers = useMemo(
    () =>
      markers.filter(
        (marker) =>
          Number.isFinite(marker.location?.coordinates?.lat) &&
          Number.isFinite(marker.location?.coordinates?.lng)
      ),
    [markers]
  );

  const points = useMemo(
    () => safeMarkers.map((marker) => [marker.location.coordinates.lat, marker.location.coordinates.lng]),
    [safeMarkers]
  );

  const signature = points.map((point) => point.join(',')).join('|');
  const icon = useMemo(
    () => makeIcon(isFood ? '#B8232F' : '#3F6B55', isFood ? 'M' : 'B'),
    [isFood]
  );

  const [tileIndex, setTileIndex] = useState(0);
  const [tileUnavailable, setTileUnavailable] = useState(false);
  const failedTileRef = useRef(-1);
  const activeIndexRef = useRef(0);
  const loadTimeoutRef = useRef(null);
  const provider = TILE_PROVIDERS[tileIndex];

  activeIndexRef.current = tileIndex;

  const advanceProvider = useCallback(() => {
    const current = activeIndexRef.current;
    if (failedTileRef.current === current) return;
    failedTileRef.current = current;
    if (current < TILE_PROVIDERS.length - 1) {
      setTileIndex(current + 1);
    } else {
      setTileUnavailable(true);
    }
  }, []);

  const handleTileLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  // Some networks block tile hosts by hanging the request instead of failing it,
  // so `tileerror` alone is not enough. Advance when a provider stays silent.
  useEffect(() => {
    loadTimeoutRef.current = setTimeout(advanceProvider, 5000);
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    };
  }, [provider.id, advanceProvider]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-line ${className}`} style={{ height }}>
      <MapContainer
        center={REMBANG_CENTER}
        zoom={9}
        scrollWheelZoom={false}
        className="rasiboga-map"
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        {tileUnavailable ? (
          <ImageOverlay
            url="/assets/map-placeholder.svg"
            bounds={LOCAL_MAP_BOUNDS}
            opacity={0.9}
            attribution="Peta contoh RASIBOGA — bukan untuk navigasi"
          />
        ) : (
          <TileLayer
            key={provider.id}
            url={provider.url}
            attribution={provider.attribution}
            subdomains={provider.subdomains || 'abc'}
            maxNativeZoom={provider.maxNativeZoom}
            maxZoom={provider.maxZoom}
            errorTileUrl={TRANSPARENT_TILE}
            eventHandlers={{ tileerror: advanceProvider, tileload: handleTileLoad }}
          />
        )}
        <FitToMarkers signature={signature} positions={points} />

        {safeMarkers.map((marker) => {
          const { lat, lng } = marker.location.coordinates;
          const verified = marker.location.verificationStatus === 'verified';
          return (
            <Marker key={marker.id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="w-56 font-sans">
                  {marker.image && (
                    <img
                      src={mediaUrl(marker.image)}
                      alt={marker.name}
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                    />
                  )}
                  <p className="font-display text-base leading-snug text-cocoa">{marker.name}</p>
                  <p className="mt-1 text-[11px] text-cocoa-soft">
                    {[marker.location.village, marker.location.district].filter(Boolean).join(', ') || 'Lokasi belum lengkap'}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
                    {verified ? (
                      <span className="inline-flex items-center gap-1 text-teal-dark">
                        <BadgeCheck size={12} /> Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-brick">
                        <CircleAlert size={12} /> Belum terverifikasi
                      </span>
                    )}
                  </p>

                  {marker.location.description && (
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-cocoa-soft">
                      {marker.location.description}
                    </p>
                  )}

                  {isFood && marker.slug ? (
                    <Link
                      to={`/makanan/${marker.slug}`}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brick px-3 py-1.5 text-[11px] font-semibold text-cream-soft"
                    >
                      Lihat detail makanan
                    </Link>
                  ) : (
                    <Link
                      to={`/bahan/${marker.slug}`}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-teal-dark px-3 py-1.5 text-[11px] font-semibold text-cream-soft"
                    >
                      Lihat gastronomi
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {tileUnavailable && (
        <div className="pointer-events-none absolute right-3 top-3 z-[1000] max-w-[240px] rounded-full bg-cream-soft/95 px-3 py-1 font-sans text-[10px] font-medium text-cocoa-soft shadow-[0_6px_16px_-12px_rgba(46,31,27,0.4)]">
          Peta cadangan — tile eksternal tidak tersedia
        </div>
      )}

      {!safeMarkers.length && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-cream-soft/85 p-6 text-center backdrop-blur-[2px]">
          <div className="max-w-sm">
            <p className="font-display text-lg">Belum ada titik pada filter ini</p>
            <p className="mt-2 text-sm text-cocoa-soft">
              Marker hanya muncul untuk lokasi yang sudah memiliki koordinat. Data contoh dapat
              dilengkapi melalui dashboard admin.
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-soft/95 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-cocoa shadow-[0_6px_16px_-12px_rgba(46,31,27,0.4)]">
          <span className={`h-2 w-2 rounded-full ${isFood ? 'bg-brick' : 'bg-teal'}`} />
          {isFood ? 'Asal makanan' : 'Asal bahan'}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-soft/95 px-3 py-1 font-sans text-[10px] font-medium text-cocoa-soft shadow-[0_6px_16px_-12px_rgba(46,31,27,0.4)]">
          Titik contoh — perlu verifikasi
        </span>
      </div>
    </div>
  );
}

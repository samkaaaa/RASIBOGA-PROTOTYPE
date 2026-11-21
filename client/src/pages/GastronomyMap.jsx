import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CircleAlert,
  Compass,
  Info,
  Layers,
  MapPin,
  MapPinned,
  Sprout,
  UtensilsCrossed,
} from 'lucide-react';
import { getData } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import OriginMap from '../components/maps/OriginMap.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { VerificationBadge } from '../components/common/Badges.jsx';

async function loadMap() {
  const [map, locations] = await Promise.all([
    getData('/locations/map'),
    getData('/locations', { params: { limit: 100 } }),
  ]);
  return { map: map.data, locations: locations.data };
}

export default function GastronomyMap() {
  const { data, loading, error, reload } = useAsync(loadMap, []);
  const [mode, setMode] = useState('food');
  const [district, setDistrict] = useState('');

  const map = data?.map;
  const allMarkers = mode === 'food' ? map?.foodMarkers || [] : map?.ingredientMarkers || [];

  const markers = useMemo(() => {
    if (!district) return allMarkers;
    return allMarkers.filter(
      (marker) => String(marker.location?.district || '').toLowerCase() === district.toLowerCase()
    );
  }, [allMarkers, district]);

  const locations = data?.locations || [];
  const withoutCoordinates = locations.filter((item) => !item.hasCoordinates);
  const verifiedLocations = locations.filter((item) => item.verificationStatus === 'verified');

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Peta gastronomi</p>
          <div className="mt-4 max-w-3xl">
            <h1 className="display-2">Rasa punya tempat asal</h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
              Dua lapis peta: asal makanan dan asal bahan pangan. Titik hanya muncul untuk lokasi
              yang memiliki koordinat, dan status verifikasinya selalu ditampilkan.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label">Lapisan peta</p>
              <div className="inline-flex rounded-full border border-line bg-cream-soft p-1">
                <button
                  type="button"
                  onClick={() => setMode('food')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-semibold transition-colors ${
                    mode === 'food' ? 'bg-brick text-cream-soft' : 'text-cocoa-soft hover:text-cocoa'
                  }`}
                  aria-pressed={mode === 'food'}
                >
                  <UtensilsCrossed size={14} />
                  Asal makanan
                </button>
                <button
                  type="button"
                  onClick={() => setMode('ingredient')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-semibold transition-colors ${
                    mode === 'ingredient'
                      ? 'bg-teal-dark text-cream-soft'
                      : 'text-cocoa-soft hover:text-cocoa'
                  }`}
                  aria-pressed={mode === 'ingredient'}
                >
                  <Sprout size={14} />
                  Asal bahan
                </button>
              </div>
            </div>

            <label className="block sm:w-64">
              <span className="label">Filter kecamatan</span>
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="input"
              >
                <option value="">Semua kecamatan</option>
                {(map?.districts || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="section pt-8 sm:pt-10">
        <div className="container-page">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !data ? (
            <Loading label="Memuat peta…" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.55fr_0.45fr]">
              <div>
                <OriginMap markers={markers} mode={mode} height="560px" />
                <p className="mt-3 flex items-start gap-2 font-sans text-[11px] leading-relaxed text-cocoa-soft">
                  <Info size={13} className="mt-0.5 shrink-0 text-teal" />
                  {map?.boundsHint ||
                    'Titik pada peta adalah contoh data awal. Verifikasi koordinat sebelum dipublikasikan.'}
                </p>
              </div>

              <div className="space-y-5">
                <div className="card p-5">
                  <h2 className="flex items-center gap-2 font-display text-lg">
                    <Layers size={17} className="text-brick" />
                    Ringkasan lapisan
                  </h2>
                  <ul className="mt-4 space-y-3 font-sans text-xs text-cocoa-soft">
                    <li className="flex items-center justify-between gap-3 border-b border-line pb-2">
                      <span>{mode === 'food' ? 'Titik makanan' : 'Titik bahan'}</span>
                      <span className="font-semibold text-cocoa">{markers.length}</span>
                    </li>
                    <li className="flex items-center justify-between gap-3 border-b border-line pb-2">
                      <span>Kecamatan terdata</span>
                      <span className="font-semibold text-cocoa">{map?.districts?.length || 0}</span>
                    </li>
                    <li className="flex items-center justify-between gap-3 border-b border-line pb-2">
                      <span>Lokasi terverifikasi</span>
                      <span className="font-semibold text-cocoa">{verifiedLocations.length}</span>
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span>Tanpa koordinat</span>
                      <span className="font-semibold text-cocoa">{withoutCoordinates.length}</span>
                    </li>
                  </ul>
                </div>

                <div className="card p-5">
                  <h2 className="flex items-center gap-2 font-display text-lg">
                    <Compass size={17} className="text-teal" />
                    Cara membaca
                  </h2>
                  <ul className="mt-4 space-y-3 font-sans text-xs leading-relaxed text-cocoa-soft">
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brick" />
                      Penanda merah menandai lokasi asal makanan.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />
                      Penanda biru menandai lokasi asal bahan.
                    </li>
                    <li className="flex gap-2">
                      <CircleAlert size={13} className="mt-0.5 shrink-0 text-brick" />
                      Sebagian besar titik masih berupa pusat kecamatan dan belum diverifikasi.
                    </li>
                  </ul>
                  <Link to="/kontribusi" className="link-underline mt-5">
                    Bantu verifikasi lokasi
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mt-14">
                <SectionHeading
                  eyebrow="Daftar titik"
                  title={mode === 'food' ? 'Makanan pada peta' : 'Bahan pada peta'}
                  description="Klik entri untuk membuka detail atau mencari bahan terkait."
                />

                {markers.length ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {markers.map((marker) => (
                      <div key={marker.id} className="card-sm flex items-center gap-3 p-4">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                            mode === 'food' ? 'bg-brick-soft text-brick' : 'bg-teal-soft text-teal-dark'
                          }`}
                        >
                          {mode === 'food' ? <UtensilsCrossed size={18} /> : <Sprout size={18} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-base">{marker.name}</p>
                          <p className="mt-0.5 truncate font-sans text-[11px] text-cocoa-soft">
                            {[marker.location?.village, marker.location?.district]
                              .filter(Boolean)
                              .join(', ') || 'Lokasi belum lengkap'}
                          </p>
                        </div>
                        {mode === 'food' && marker.slug ? (
                          <Link
                            to={`/makanan/${marker.slug}`}
                            className="shrink-0 font-sans text-[11px] font-semibold text-brick hover:underline"
                          >
                            Detail
                          </Link>
                        ) : (
                          <Link
                            to={`/bahan/${marker.slug}`}
                            className="shrink-0 font-sans text-[11px] font-semibold text-teal-dark hover:underline"
                          >
                            Gastronomi
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-6 text-sm text-cocoa-soft">
                    Tidak ada titik pada filter ini. Coba pilih kecamatan lain atau lihat lapisan peta
                    yang berbeda.
                  </p>
                )}
              </div>

              <div className="mt-14">
                <SectionHeading
                  eyebrow="Data lokasi"
                  title="Semua lokasi terdata"
                  description="Termasuk lokasi yang belum memiliki koordinat. Data ini menjadi dasar pemetaan berikutnya."
                />

                <div className="card mt-6 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                      <thead className="border-b border-line bg-cream/50">
                        <tr>
                          <th className="admin-th">Lokasi</th>
                          <th className="admin-th">Kecamatan</th>
                          <th className="admin-th">Koordinat</th>
                          <th className="admin-th">Verifikasi</th>
                          <th className="admin-th">Jenis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locations.map((item) => (
                          <tr key={item._id} className="border-b border-line last:border-0">
                            <td className="admin-td">
                              <span className="flex items-center gap-2">
                                <MapPin size={13} className="text-brick" />
                                {item.name}
                              </span>
                            </td>
                            <td className="admin-td text-cocoa-soft">{item.district || '—'}</td>
                            <td className="admin-td font-sans text-xs text-cocoa-soft">
                              {item.hasCoordinates
                                ? `${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}`
                                : 'Belum tersedia'}
                            </td>
                            <td className="admin-td">
                              <VerificationBadge status={item.verificationStatus} />
                            </td>
                            <td className="admin-td text-xs text-cocoa-soft">
                              {(item.locationType || [])
                                .map((type) =>
                                  type === 'food-origin' ? 'Makanan' : 'Bahan'
                                )
                                .join(' · ') || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {withoutCoordinates.length > 0 && (
                  <p className="mt-4 flex items-start gap-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                    <CircleAlert size={14} className="mt-0.5 shrink-0 text-brick" />
                    {withoutCoordinates.length} lokasi belum memiliki koordinat dan tidak ditampilkan
                    di peta. Contoh: {withoutCoordinates.slice(0, 4).map((item) => item.name).join(', ')}.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-[2rem] border border-teal/20 bg-teal-soft/50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal text-cream-soft">
                <MapPinned size={22} />
              </span>
              <div>
                <h2 className="font-display text-xl">Koordinat adalah data yang harus dirawat.</h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-cocoa-soft">
                  Titik contoh memakai pusat kecamatan. Verifikasi lapangan bersama pemerintah desa
                  dan pelaku kuliner diperlukan sebelum status berubah menjadi terverifikasi.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-teal/25 bg-cream-soft/80 px-3 py-1.5 font-sans text-[11px] font-medium text-teal-dark sm:self-center">
              <BadgeCheck size={13} />
              {verifiedLocations.length} terverifikasi
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

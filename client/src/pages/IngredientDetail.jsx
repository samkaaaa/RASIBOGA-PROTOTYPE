import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Leaf, MapPin } from 'lucide-react';

import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { VerificationBadge } from '../components/common/Badges.jsx';
import RichText from '../components/common/RichText.jsx';
import OriginMap from '../components/maps/OriginMap.jsx';

const isMappable = (location) =>
  Number.isFinite(location?.coordinates?.lat) && Number.isFinite(location?.coordinates?.lng);

export default function IngredientDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useAsync(
    () => getData(`/ingredients/slug/${encodeURIComponent(slug)}`).then((response) => response.data),
    [slug]
  );

  if (loading && !data) {
    return (
      <div className="container-page py-16">
        <Loading label="Memuat detail bahan…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page py-16">
        <ErrorState
          message={error || 'Bahan tidak ditemukan.'}
          onRetry={reload}
        />
        <div className="mt-6 text-center">
          <Link to="/glosarium" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Kembali ke glosarium
          </Link>
        </div>
      </div>
    );
  }

  const ingredient = data;
  const locations = ingredient.originLocations || [];
  const markers = locations
    .filter(isMappable)
    .map((location) => ({
      id: `${ingredient._id}-${location._id}`,
      name: ingredient.name,
      slug: ingredient.slug,
      image: ingredient.image?.url || '',
      location,
    }));
  const unmappedCount = locations.length - markers.length;

  return (
    <>
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.16em] text-cocoa-faint">
          <Link to="/" className="hover:text-brick">
            Beranda
          </Link>
          <span>/</span>
          <Link to="/glosarium" className="hover:text-brick">
            Glosarium
          </Link>
          <span>/</span>
          <span className="text-cocoa-soft">{ingredient.name}</span>
        </nav>
      </div>

      <section className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-line bg-cream-deep shadow-[0_40px_80px_-55px_rgba(46,31,27,0.45)]">
              <img
                src={mediaUrl(ingredient.image?.url) || '/assets/ingredients/placeholder.svg'}
                alt={ingredient.name}
                className="aspect-[4/3] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = '/assets/ingredients/placeholder.svg';
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/glosarium" className="btn-outline btn-sm">
                <ArrowLeft size={14} /> Kembali ke glosarium
              </Link>
              <Link to="/peta" className="btn-ghost btn-sm">
                <MapPin size={14} /> Lihat peta gastronomi
              </Link>
            </div>
          </div>

          <div>
            <p className="eyebrow">Deskripsi gastronomi</p>
            <h1 className="display-2 mt-3">{ingredient.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <VerificationBadge status={ingredient.verificationStatus} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-soft/80 px-3 py-1 font-sans text-[11px] text-cocoa-soft">
                <MapPin size={12} />
                {markers.length} titik asal dipetakan
              </span>
            </div>

            <p className="mt-6 border-l-2 border-brick/40 pl-4 font-sans text-[1.02rem] leading-relaxed text-cocoa-soft">
              {ingredient.description || 'Ringkasan bahan ini belum tersedia.'}
            </p>

            {ingredient.gastronomyDescription?.trim() ? (
              <div className="mt-8">
                <RichText
                  content={ingredient.gastronomyDescription}
                  className="prose-editorial max-w-none"
                />
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-5 font-sans text-sm text-cocoa-soft">
                Narasi gastronomi bahan ini belum ditulis. Tim RASIBOGA sedang mendokumentasikan
                sejarah, karakter rasa, dan perannya dalam dapur Rembang.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-tight border-y border-line bg-cream/40">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Asal-usul</p>
              <h2 className="mt-2 font-display text-2xl text-cocoa sm:text-3xl">
                Wilayah asal {ingredient.name}
              </h2>
              <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-cocoa-soft">
                Marker pada peta di bawah diambil dari seluruh lokasi asal yang terhubung dengan
                bahan ini dan sudah memiliki koordinat di basis data.
              </p>
            </div>
            <span className="chip">
              <Leaf size={12} className="mr-1.5 text-teal" />
              {locations.length} wilayah tercatat
            </span>
          </div>

          {locations.length ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <li
                  key={location._id}
                  className="card-sm flex min-w-0 items-start gap-3 p-4"
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      isMappable(location)
                        ? 'bg-teal-soft text-teal-dark'
                        : 'bg-brick-soft text-brick'
                    }`}
                  >
                    <MapPin size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-cocoa">
                      {location.name}
                    </p>
                    <p className="mt-0.5 truncate font-sans text-[11px] text-cocoa-soft">
                      {[location.village, location.district, location.regency]
                        .filter(Boolean)
                        .join(', ') || 'Wilayah belum lengkap'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-cocoa-faint">
                      {isMappable(location)
                        ? `${location.coordinates.lat}, ${location.coordinates.lng}`
                        : 'Koordinat belum tersedia'}
                    </p>
                  </div>
                  {isMappable(location) && (
                    <a
                      href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Buka titik di Google Maps"
                      className="shrink-0 rounded-full p-1.5 text-cocoa-faint transition-colors hover:bg-cream hover:text-brick"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-6 font-sans text-sm text-cocoa-soft">
              Lokasi asal bahan ini belum tercatat di basis data.
            </p>
          )}

          {unmappedCount > 0 && (
            <p className="mt-3 font-sans text-[11px] text-brick">
              {unmappedCount} wilayah belum memiliki koordinat sehingga belum muncul sebagai marker.
            </p>
          )}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-cream-deep">
          <OriginMap markers={markers} mode="ingredient" height="460px" />
        </div>
        <p className="mt-3 font-sans text-[11px] leading-relaxed text-cocoa-faint">
          Titik pada peta merupakan data contoh yang perlu diverifikasi lapangan. Peta tetap
          menampilkan peta cadangan apabila layanan tile eksternal tidak tersedia.
        </p>
      </section>
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import RembangMap, { buildDistrictData } from './RembangMap.jsx';

export default function OriginSection({ map, loading = false }) {
  const markers = map?.foodMarkers || [];
  const districtNames = map?.districts || [];

  const districts = useMemo(
    () => buildDistrictData(markers, districtNames),
    [markers, districtNames]
  );

  const [activeDistrict, setActiveDistrict] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    if (!districts.length) return;
    if (!districts.some((district) => district.name === activeDistrict)) {
      setActiveDistrict(districts[0].name);
    }
  }, [activeDistrict, districts]);

  const missingCoordinates = districts.some((district) => !Number.isFinite(district.lat));

  const handleSelect = (name) => {
    setActiveDistrict(name);
    if (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      mapRef.current?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <section className="section border-y border-line bg-cream/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Peta gastronomi"
          title="Rasa punya tempat asal"
          description="Setiap hidangan terhubung dengan kecamatan asalnya. Pilih titik untuk melihat jumlah entri yang sudah terdokumentasi."
          action={{ to: '/peta', label: 'Buka peta lengkap' }}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Reveal>
            <div ref={mapRef}>
              {loading && !map ? (
                <div className="h-[420px] animate-pulse rounded-3xl border border-line bg-cream-deep" />
              ) : (
                <RembangMap
                  markers={markers}
                  districtNames={districtNames}
                  activeDistrict={activeDistrict}
                  onSelect={handleSelect}
                  height={420}
                />
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-3xl border border-line bg-cream-soft p-5 shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] sm:p-6">
              <p className="eyebrow">Kecamatan</p>
              <h3 className="mt-2 font-display text-2xl leading-[1.1] tracking-[-0.01em]">
                Empat titik rasa
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa-soft">
                Pilih kecamatan untuk menyorot titiknya pada peta.
              </p>

              <ul className="mt-5 space-y-2">
                {districts.map((district) => {
                  const active = district.name === activeDistrict;
                  return (
                    <li key={district.name}>
                      <button
                        type="button"
                        onClick={() => handleSelect(district.name)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                          active
                            ? 'border-brick/30 bg-brick-soft/60 shadow-[0_10px_24px_-20px_rgba(46,31,27,0.4)]'
                            : 'border-line bg-cream-soft hover:border-brick/25 hover:bg-cream'
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
                            active ? 'bg-brick text-cream-soft' : 'bg-brick/10 text-brick'
                          }`}
                        >
                          <MapPin size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block font-display text-lg leading-tight ${
                              active ? 'text-brick-dark' : 'text-cocoa'
                            }`}
                          >
                            {district.name}
                          </span>
                          <span className="mt-0.5 block font-sans text-[11px] text-cocoa-soft">
                            {district.count} makanan
                            {Number.isFinite(district.lat) ? '' : ' · koordinat menyusul'}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={15}
                          className={active ? 'text-brick' : 'text-cocoa-faint'}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto border-t border-line pt-5">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cocoa-faint">
                  Status verifikasi
                </p>
                <div className="mt-3 flex flex-wrap gap-3 font-sans text-[11px] text-cocoa-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-green" />
                    Terverifikasi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-cocoa-soft/50" />
                    Draf
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-cocoa-soft">
                  {missingCoordinates
                    ? 'Koordinat sedang dilengkapi. Titik yang tampil adalah acuan kawasan, bukan alamat produksi.'
                    : 'Titik peta merupakan acuan kecamatan; verifikasi lapangan terus dilakukan.'}
                </p>

                <Link to="/peta" className="btn-outline btn-sm mt-4 w-full">
                  Buka peta lengkap
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

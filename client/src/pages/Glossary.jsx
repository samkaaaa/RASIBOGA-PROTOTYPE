import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookMarked, Leaf, Search, Sprout } from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { glossaryCategories, glossaryTerms } from '../data/glossary.js';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { VerificationBadge } from '../components/common/Badges.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';

export default function Glossary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [category, setCategory] = useState('Semua');

  const { data, loading, error, reload } = useAsync(
    () => getData('/ingredients', { params: { limit: 100 } }),
    []
  );

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (searchInput === query) return undefined;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) next.set('search', searchInput.trim());
      else next.delete('search');
      setSearchParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const normalizedQuery = query.trim().toLowerCase();

  const terms = useMemo(() => {
    return glossaryTerms
      .filter((item) => category === 'Semua' || item.category === category)
      .filter(
        (item) =>
          !normalizedQuery ||
          item.term.toLowerCase().includes(normalizedQuery) ||
          item.definition.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [category, normalizedQuery]);

  const grouped = useMemo(() => {
    const groups = new Map();
    terms.forEach((item) => {
      const letter = item.term.charAt(0).toUpperCase();
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(item);
    });
    return [...groups.entries()];
  }, [terms]);

  const ingredients = (data?.data || []).filter((item) => {
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      (item.description || '').toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Glosarium</p>
          <div className="mt-4 max-w-3xl">
            <h1 className="display-2">Istilah dapur, dari brambang sampai wedang</h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
              Daftar istilah kuliner Jawa dan Rembang yang dipakai di platform ini, disertai bahan
              pangan yang sudah terdata beserta asal-usulnya.
            </p>
          </div>

          <div className="relative mt-8 max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-faint"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari istilah atau bahan, misalnya santan…"
              aria-label="Cari istilah atau bahan"
              className="input h-12 pl-11"
            />
          </div>
        </div>
      </section>

      <section className="section pt-10">
        <div className="container-page">
          <div className="flex flex-wrap gap-2">
            {glossaryCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`chip transition-colors ${
                  category === item
                    ? 'border-brick bg-brick text-cream-soft'
                    : 'hover:border-brick/40'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 font-display text-2xl">
                  <BookMarked size={20} className="text-brick" />
                  Istilah
                </h2>
                <span className="font-sans text-xs text-cocoa-faint">{terms.length} istilah</span>
              </div>

              {terms.length ? (
                <div className="mt-5 space-y-8">
                  {grouped.map(([letter, items]) => (
                    <div key={letter}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-cocoa font-display text-sm text-cream-soft">
                          {letter}
                        </span>
                        <span className="h-px flex-1 bg-cocoa/10" />
                      </div>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        {items.map((item) => (
                          <div key={item.term} className="card-sm min-w-0 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <dt className="font-display text-lg leading-snug">{item.term}</dt>
                              <span className="chip shrink-0">{item.category}</span>
                            </div>
                            <dd className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                              {item.definition}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-6 text-sm text-cocoa-soft">
                  Tidak ada istilah yang cocok dengan pencarian Anda.
                </p>
              )}
            </div>

            <aside>
              <div className="card p-5">
                <h2 className="flex items-center gap-2 font-display text-xl">
                  <Leaf size={18} className="text-teal" />
                  Bahan pangan terdata
                </h2>
                <p className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                  {data?.meta?.total || 0} bahan tercatat di basis data. Status verifikasi
                  menunjukkan apakah asal-usulnya sudah diperiksa.
                </p>

                {error ? (
                  <div className="mt-4">
                    <ErrorState message={error} onRetry={reload} />
                  </div>
                ) : loading && !data ? (
                  <Loading label="Memuat bahan…" className="py-8" />
                ) : ingredients.length ? (
                  <ul className="mt-4 space-y-2">
                    {ingredients.slice(0, 40).map((ingredient) => (
                      <li key={ingredient._id}>
                        <div className="flex items-center gap-3 rounded-xl border border-line bg-cream-soft/60 p-2">
                          <img
                            src={
                              mediaUrl(ingredient.image?.url) ||
                              '/assets/ingredients/placeholder.svg'
                            }
                            alt={ingredient.name}
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded-lg object-cover"
                            onError={(event) => {
                              event.currentTarget.src = '/assets/ingredients/placeholder.svg';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-sans text-sm font-semibold text-cocoa">
                              {ingredient.name}
                            </p>
                            <p className="truncate font-sans text-[10px] text-cocoa-faint">
                              {ingredient.originLocations
                                ?.map((item) => item.district)
                                .filter(Boolean)
                                .join(', ') || 'Asal belum tercatat'}
                            </p>
                          </div>
                          <VerificationBadge status={ingredient.verificationStatus} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 font-sans text-xs text-cocoa-soft">
                    Tidak ada bahan yang cocok dengan pencarian.
                  </p>
                )}

                {ingredients.length > 40 && (
                  <p className="mt-3 font-sans text-[11px] text-cocoa-faint">
                    Menampilkan 40 dari {ingredients.length} bahan.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-[2rem] border border-line bg-cream/60 p-6 sm:p-8">
          <SectionHeading
            eyebrow="Bantu lengkapi"
            title="Istilah lokal belum semuanya tercatat"
            description="Penulisan istilah dapat berbeda antar desa. Kirimkan koreksi atau tambahan melalui formulir kontribusi."
            action={{ to: '/kontribusi', label: 'Kirim istilah' }}
          />
        </div>
      </section>
    </>
  );
}

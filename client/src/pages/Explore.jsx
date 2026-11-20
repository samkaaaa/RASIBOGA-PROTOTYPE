import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FilterX, Search, SlidersHorizontal } from 'lucide-react';
import { getData } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import FoodCard from '../components/cards/FoodCard.jsx';
import { CardSkeletonGrid } from '../components/common/Loading.jsx';
import { EmptyState, ErrorState } from '../components/common/States.jsx';
import { PROVENANCE_OPTIONS } from '../utils/constants.js';
import { formatNumber } from '../utils/format.js';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'featured', label: 'Unggulan' },
  { value: 'name', label: 'Nama A–Z' },
  { value: 'oldest', label: 'Terlama' },
];

async function loadExplore(params) {
  const [foods, locations] = await Promise.all([
    getData('/foods', { params }),
    getData('/locations', { params: { limit: 100 } }),
  ]);

  const districts = Array.from(
    new Set((locations.data || []).map((item) => item.district).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return { foods: foods.data, meta: foods.meta, districts };
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const queryString = searchParams.toString();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const provenance = searchParams.get('provenance') || '';
  const district = searchParams.get('district') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data, loading, error, reload } = useAsync(
    () =>
      loadExplore({
        limit: 9,
        page,
        sort,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(provenance ? { provenance } : {}),
        ...(district ? { district } : {}),
      }),
    [queryString]
  );

  // Keep the input in sync when filters are changed from elsewhere (e.g. map links).
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce typing into the URL.
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) next.set('search', searchInput.trim());
      else next.delete('search');
      next.delete('page');
      setSearchParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeFilterCount = useMemo(
    () => [search, category, provenance, district].filter(Boolean).length,
    [search, category, provenance, district]
  );

  const meta = data?.meta;
  const total = meta?.total || 0;
  const totalPages = meta?.totalPages || 1;

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Katalog kuliner</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="display-2">Jelajahi rasa Rembang</h1>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
                Cari hidangan berdasarkan nama, kategori, jenis provenance, atau kecamatan asal.
                Setiap entri menampilkan status sumbernya secara terbuka.
              </p>
            </div>
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-cocoa-faint">
              {loading ? 'Memuat…' : `${formatNumber(total)} entri ditemukan`}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-faint"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari lontong, kelo mrico, wedang…"
                aria-label="Cari makanan"
                className="input h-12 pl-11 pr-10"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-sans text-[11px] text-cocoa-faint hover:text-cocoa"
                >
                  Hapus
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="btn-outline h-12 lg:hidden"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} />
              Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>
      </section>

      <section className="section pt-8 sm:pt-10">
        <div className="container-page">
          <div
            className={`${showFilters ? 'block' : 'hidden'} mb-8 space-y-5 rounded-3xl border border-line bg-cream-soft p-5 lg:block`}
          >
            <div>
              <p className="label">Kategori</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`chip transition-colors ${
                    !category ? 'border-brick bg-brick text-cream-soft' : 'hover:border-brick/40'
                  }`}
                >
                  Semua
                </button>
                {['Makanan Berat', 'Jajanan Tradisional', 'Minuman'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateParam('category', item)}
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="label">Provenance</span>
                <select
                  value={provenance}
                  onChange={(event) => updateParam('provenance', event.target.value)}
                  className="input"
                >
                  <option value="">Semua provenance</option>
                  {PROVENANCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label">Kecamatan asal</span>
                <select
                  value={district}
                  onChange={(event) => updateParam('district', event.target.value)}
                  className="input"
                >
                  <option value="">Semua kecamatan</option>
                  {(data?.districts || []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label">Urutkan</span>
                <select
                  value={sort}
                  onChange={(event) => updateParam('sort', event.target.value)}
                  className="input"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-ghost btn-sm w-full border border-line"
                  disabled={!activeFilterCount && sort === 'newest'}
                >
                  <FilterX size={14} />
                  Reset filter
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !data ? (
            <CardSkeletonGrid count={6} />
          ) : !data?.foods?.length ? (
            <EmptyState
              icon={Search}
              title="Belum ada makanan yang cocok"
              description="Coba kata kunci lain atau longgarkan filter yang aktif. Katalog akan bertambah seiring proses dokumentasi."
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.foods.map((food) => (
                  <FoodCard key={food._id} food={food} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6"
                  aria-label="Navigasi halaman katalog"
                >
                  <button
                    type="button"
                    onClick={() => updateParam('page', String(page - 1))}
                    disabled={page <= 1}
                    className="btn-outline btn-sm"
                  >
                    <ChevronLeft size={15} />
                    Sebelumnya
                  </button>
                  <p className="font-sans text-xs uppercase tracking-[0.18em] text-cocoa-faint">
                    Halaman {page} dari {totalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateParam('page', String(page + 1))}
                    disabled={page >= totalPages}
                    className="btn-outline btn-sm"
                  >
                    Berikutnya
                    <ChevronRight size={15} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

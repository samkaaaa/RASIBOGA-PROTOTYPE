import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import ArticleCard from '../components/cards/ArticleCard.jsx';
import Reveal from '../components/common/Reveal.jsx';
import { Loading } from '../components/common/Loading.jsx';
import { EmptyState, ErrorState } from '../components/common/States.jsx';
import { formatDate } from '../utils/format.js';

export default function Stories() {
  const { data, loading, error, reload } = useAsync(
    () => getData('/articles', { params: { limit: 30 } }),
    []
  );
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const articles = data?.data || [];
  const categories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category).filter(Boolean))).sort(),
    [articles]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchCategory = !category || article.category === category;
      const matchSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        (article.excerpt || '').toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [articles, category, search]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Cerita &amp; budaya</p>
          <div className="mt-4 max-w-3xl">
            <h1 className="display-2">Catatan di balik sepiring hidangan</h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
              Tulisan tentang praktik dokumentasi, verifikasi sumber, dan rencana pemetaan kuliner
              Rembang. Semua artikel adalah pengantar, bukan klaim sejarah final.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('')}
                className={`chip transition-colors ${
                  !category ? 'border-brick bg-brick text-cream-soft' : 'hover:border-brick/40'
                }`}
              >
                Semua
              </button>
              {categories.map((item) => (
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

            <div className="relative sm:w-72">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-faint"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari cerita…"
                aria-label="Cari cerita"
                className="input h-10 pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !data ? (
            <Loading label="Memuat cerita…" />
          ) : !filtered.length ? (
            <EmptyState
              icon={BookOpen}
              title="Belum ada cerita yang cocok"
              description="Coba kata kunci lain atau pilih kategori yang berbeda."
            />
          ) : (
            <>
              {featured && (
                <Reveal>
                  <article className="card card-hover group grid overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
                    <Link
                      to={`/cerita/${featured.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden bg-cream-deep lg:aspect-auto lg:h-full"
                    >
                      <img
                        src={mediaUrl(featured.coverImage) || '/assets/articles/article-1.svg'}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-cream-soft/90 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-brick">
                        {featured.category}
                      </span>
                    </Link>

                    <div className="flex flex-col justify-center p-7 sm:p-10">
                      <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-cocoa-faint">
                        Sorotan · {formatDate(featured.createdAt)}
                      </p>
                      <h2 className="mt-3 font-display text-3xl leading-tight transition-colors group-hover:text-brick sm:text-4xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <span className="font-sans text-xs text-cocoa-faint">
                          Oleh {featured.author || 'Tim RASIBOGA'}
                        </span>
                        <Link
                          to={`/cerita/${featured.slug}`}
                          className="link-underline"
                        >
                          Baca artikel
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )}

              {rest.length > 0 && (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article, index) => (
                    <Reveal key={article._id} delay={(index % 3) * 0.06}>
                      <ArticleCard article={article} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-[2rem] bg-cocoa px-6 py-10 text-cream-soft sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Punya cerita keluarga?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/70">
                Cerita dapur, resep turun-temurun, atau dokumentasi proses memasak dapat dikirim
                melalui formulir kontribusi. Editor akan meninjau sebelum publikasi.
              </p>
            </div>
            <Link to="/kontribusi" className="btn bg-cream-soft text-brick hover:bg-cream shrink-0">
              Kirim cerita
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

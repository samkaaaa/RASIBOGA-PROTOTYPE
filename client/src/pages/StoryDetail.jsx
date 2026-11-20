import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, PenLine, Share2 } from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import RichText from '../components/common/RichText.jsx';
import ArticleCard from '../components/cards/ArticleCard.jsx';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { formatDate } from '../utils/format.js';

async function loadStory(slug) {
  const [article, related] = await Promise.all([
    getData(`/articles/${encodeURIComponent(slug)}`),
    getData('/articles', { params: { limit: 4 } }),
  ]);
  return {
    article: article.data,
    related: (related.data || []).filter((item) => item.slug !== slug).slice(0, 3),
  };
}

export default function StoryDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useAsync(() => loadStory(slug), [slug]);

  if (loading && !data) {
    return (
      <div className="container-page py-24">
        <Loading label="Memuat artikel…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-20">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/cerita" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Semua cerita
          </Link>
        </div>
      </div>
    );
  }

  const { article, related } = data;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      /* user cancelled or clipboard unavailable */
    }
  };

  return (
    <>
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.16em] text-cocoa-faint">
          <Link to="/" className="hover:text-brick">
            Beranda
          </Link>
          <span>/</span>
          <Link to="/cerita" className="hover:text-brick">
            Cerita
          </Link>
          <span>/</span>
          <span className="text-cocoa-soft">{article.category}</span>
        </nav>
      </div>

      <article className="container-page py-10">
        <header className="mx-auto max-w-3xl text-center">
          <span className="chip-brick">{article.category}</span>
          <h1 className="display-1 mt-5">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-5 text-[1.1rem] leading-relaxed text-cocoa-soft">{article.excerpt}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 font-sans text-xs text-cocoa-faint">
            <span className="inline-flex items-center gap-1.5">
              <PenLine size={13} className="text-teal" />
              {article.author || 'Tim RASIBOGA'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-teal" />
              {formatDate(article.createdAt)}
            </span>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[11px] hover:border-cocoa/30"
            >
              <Share2 size={12} />
              Bagikan
            </button>
          </div>
        </header>

        {article.coverImage && (
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-cream-deep">
            <img
              src={mediaUrl(article.coverImage)}
              alt={article.title}
              className="aspect-[16/8] w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            {article.content?.trim() ? (
              <RichText content={article.content} className="prose-editorial" />
            ) : (
              <p className="rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-6 text-sm text-cocoa-soft">
                Isi artikel belum tersedia.
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Link to="/cerita" className="btn-outline btn-sm">
                <ArrowLeft size={14} />
                Semua cerita
              </Link>
              <Link to="/kontribusi" className="link-underline">
                Kirim cerita Anda
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <aside>
            <div className="card p-5">
              <h2 className="font-display text-lg">Catatan editorial</h2>
              <p className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                Artikel ini adalah pengantar dokumentasi. Klaim budaya dan sejarah wajib memiliki
                sumber atau ditandai belum terverifikasi.
              </p>
              <Link to="/cerita/panduan-verifikasi-sumber" className="link-underline mt-4">
                Panduan sumber
                <ArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section border-t border-line bg-cream/40">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Bacaan lain</p>
                <h2 className="display-2 mt-3">Lanjutkan menjelajah</h2>
              </div>
              <Link to="/cerita" className="link-underline shrink-0">
                Semua
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item._id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

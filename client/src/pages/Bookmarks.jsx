import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, MapPin, Trash2 } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext.jsx';
import { mediaUrl } from '../services/api.js';
import { EmptyState } from '../components/common/States.jsx';
import { ProvenanceBadge } from '../components/common/Badges.jsx';
import { formatDate } from '../utils/format.js';

export default function Bookmarks() {
  const { items, count, remove, clear } = useBookmarks();

  const clearAll = () => {
    if (window.confirm('Hapus semua makanan dari simpanan? Tindakan ini tidak dapat dibatalkan.')) {
      clear();
    }
  };

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Simpanan saya</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="display-2">Daftar rasa untuk nanti</h1>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
                Simpanan disimpan di peramban Anda (localStorage) — tanpa akun dan tanpa dikirim ke
                server. Menghapus data peramban akan menghapus daftar ini.
              </p>
            </div>
            {count > 0 && (
              <button type="button" onClick={clearAll} className="btn-outline btn-sm shrink-0">
                <Trash2 size={14} />
                Hapus semua
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="section pt-10">
        <div className="container-page">
          {!items.length ? (
            <EmptyState
              icon={Bookmark}
              title="Belum ada simpanan"
              description="Tekan ikon penanda pada kartu makanan untuk menyimpannya di sini. Daftar ini berguna saat Anda ingin membandingkan beberapa hidangan."
              action={{ to: '/jelajah', label: 'Jelajahi katalog' }}
            />
          ) : (
            <>
              <p className="font-sans text-xs uppercase tracking-[0.18em] text-cocoa-faint">
                {count} makanan tersimpan
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <article key={item.slug} className="card card-hover group overflow-hidden">
                    <Link to={`/makanan/${item.slug}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                        <img
                          src={mediaUrl(item.image) || '/assets/food-placeholder.svg'}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          onError={(event) => {
                            event.currentTarget.src = '/assets/food-placeholder.svg';
                          }}
                        />
                        <span className="absolute left-4 top-4 rounded-full bg-cream-soft/90 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cocoa">
                          {item.category || 'Kuliner'}
                        </span>
                      </div>
                      <div className="p-5">
                        <ProvenanceBadge type={item.provenance} />
                        <h2 className="mt-3 font-display text-xl transition-colors group-hover:text-brick">
                          {item.name}
                        </h2>
                        <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-[11px] text-cocoa-faint">
                          <MapPin size={12} className="text-teal" />
                          Disimpan {formatDate(item.savedAt, { month: 'short' })}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
                      <Link
                        to={`/makanan/${item.slug}`}
                        className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-brick"
                      >
                        Buka detail
                        <ArrowRight size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        className="inline-flex items-center gap-1 font-sans text-[11px] text-cocoa-faint transition-colors hover:text-brick"
                        aria-label={`Hapus ${item.name} dari simpanan`}
                      >
                        <Trash2 size={13} />
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

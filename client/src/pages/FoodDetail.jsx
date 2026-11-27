import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChefHat,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  ScrollText,
  Sparkles,
  Users,
  Utensils,
} from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { useBookmarks } from '../context/BookmarkContext.jsx';
import FoodCard from '../components/cards/FoodCard.jsx';
import VideoCard from '../components/cards/VideoCard.jsx';
import OriginMap from '../components/maps/OriginMap.jsx';
import RichText from '../components/common/RichText.jsx';
import Reveal from '../components/common/Reveal.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import {
  CategoryBadge,
  DraftBadge,
  ProvenanceBadge,
  VerificationBadge,
} from '../components/common/Badges.jsx';
import { formatMinutes, formatNumber, totalTime } from '../utils/format.js';

function Sources({ sources = [] }) {
  const items = sources.filter(Boolean);
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-cocoa/15 bg-cream/40 p-4 font-sans text-xs leading-relaxed text-cocoa-soft">
        Sumber informasi belum dicantumkan. Konten ini tidak boleh dianggap sebagai rujukan sejarah
        sampai sumber primer atau sekunder ditambahkan.
      </p>
    );
  }

  return (
    <ul className="space-y-2 font-sans text-sm text-cocoa-soft">
      {items.map((source) => (
        <li key={source} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brick" />
          {/^https?:\/\//i.test(source) ? (
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 break-all text-brick underline decoration-brick/30 underline-offset-4"
            >
              {source}
              <ExternalLink size={12} className="shrink-0" />
            </a>
          ) : (
            <span>{source}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function FoodDetail() {
  const { slug } = useParams();
  const { isSaved, toggle } = useBookmarks();
  const { data, loading, error, reload } = useAsync(
    () => getData(`/foods/${encodeURIComponent(slug)}`).then((response) => response.data),
    [slug]
  );

  if (loading && !data) {
    return (
      <div className="container-page py-24">
        <Loading label="Memuat detail makanan…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-20">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/jelajah" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  const { food, recipe, recipes = [], videos = [], ingredients = [], related = [] } = data;
  const saved = isSaved(food.slug);
  const origin = food.originLocation;
  const isDraft = food.contentStatus === 'draft';
  const mapMarkers =
    origin?.hasCoordinates && origin?.coordinates
      ? [
          {
            id: food._id,
            name: food.name,
            slug: food.slug,
            category: food.category,
            image: food.mainImage?.url || '',
            location: origin,
          },
        ]
      : [];

  return (
    <>
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.16em] text-cocoa-faint">
          <Link to="/" className="hover:text-brick">
            Beranda
          </Link>
          <span>/</span>
          <Link to="/jelajah" className="hover:text-brick">
            Jelajah
          </Link>
          <span>/</span>
          <span className="text-cocoa-soft">{food.name}</span>
        </nav>
      </div>

      <section className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-cream-deep shadow-[0_40px_80px_-55px_rgba(46,31,27,0.45)]">
              <img
                src={mediaUrl(food.mainImage?.url) || '/assets/food-placeholder.svg'}
                alt={food.name}
                className="aspect-[4/3] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = '/assets/food-placeholder.svg';
                }}
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <CategoryBadge>{food.category}</CategoryBadge>
                {isDraft && <DraftBadge />}
              </div>
            </div>

            {food.gallery?.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {food.gallery.map((image, index) => (
                  <img
                    key={image.publicId || image.url || index}
                    src={mediaUrl(image.url)}
                    alt={`Dokumentasi ${food.name} ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl border border-line object-cover"
                  />
                ))}
              </div>
            )}
          </Reveal>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProvenanceBadge type={food.provenance?.type} />
              {origin?.verificationStatus && (
                <VerificationBadge status={origin.verificationStatus} />
              )}
            </div>

            <h1 className="display-1 mt-5">{food.name}</h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-cocoa-soft">
              {food.description || 'Deskripsi hidangan belum tersedia.'}
            </p>

            <dl className="mt-8 grid gap-4 border-y border-line py-6 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-[10px] uppercase tracking-[0.2em] text-cocoa-faint">
                  Asal yang dikaitkan
                </dt>
                <dd className="mt-1.5 flex items-start gap-2 font-sans text-sm text-cocoa">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-teal" />
                  <span>
                    {origin
                      ? [origin.village, origin.district, origin.regency]
                          .filter(Boolean)
                          .join(', ')
                      : 'Belum tercatat'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-sans text-[10px] uppercase tracking-[0.2em] text-cocoa-faint">
                  Ketersediaan resep
                </dt>
                <dd className="mt-1.5 flex items-center gap-2 font-sans text-sm text-cocoa">
                  <ChefHat size={15} className="shrink-0 text-brick" />
                  {recipe ? recipe.title || `Resep ${food.name}` : 'Belum terdokumentasi'}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              {recipe ? (
                <>
                  <Link to={`/resep/${recipe._id}`} className="btn-primary">
                    <ScrollText size={16} />
                    Lihat resep
                  </Link>
                  <Link to={`/resep/${recipe._id}/memasak`} className="btn-teal">
                    <ChefHat size={16} />
                    Mode memasak
                  </Link>
                </>
              ) : (
                <span className="chip border-line bg-cream-soft text-cocoa-soft">
                  <Info size={13} />
                  Resep belum terdokumentasi
                </span>
              )}

              <button
                type="button"
                onClick={() => toggle(food)}
                aria-pressed={saved}
                className={`btn-outline ${saved ? 'border-brick text-brick' : ''}`}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Tersimpan' : 'Simpan'}
              </button>
            </div>

            {isDraft && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-brick/20 bg-brick-soft/60 p-4">
                <Info size={17} className="mt-0.5 shrink-0 text-brick" />
                <p className="font-sans text-xs leading-relaxed text-cocoa">
                  Konten ini masih berstatus <strong>draf</strong>. Deskripsi dan resep disusun
                  sebagai kerangka dokumentasi dan perlu diverifikasi bersama narasumber atau pelaku
                  kuliner setempat.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sejarah & filosofi */}
      <section className="section border-y border-line bg-cream/40">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="display-2">Sejarah &amp; konteks</h2>
            {food.history?.trim() ? (
              <RichText
                content={food.history}
                className="prose-editorial mt-6"
                imageLayout="corners"
              />
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-cocoa/15 bg-cream-soft p-6">
                <p className="font-display text-lg">Catatan sejarah belum tersedia</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-cocoa-soft">
                  Tim RASIBOGA belum memiliki sumber yang dapat dipertanggungjawabkan untuk bagian
                  ini. Alih-alih menuliskan klaim yang belum pasti, bagian ini dibiarkan kosong
                  sampai wawancara dan penelusuran sumber selesai.
                </p>
                <Link to="/kontribusi" className="link-underline mt-5">
                  Kirim cerita atau sumber
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {food.philosophy?.trim() && (
              <div className="mt-10">
                <h2 className="display-2">Filosofi &amp; penyajian</h2>
                <RichText content={food.philosophy} className="prose-editorial mt-6" />
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-xl">Sumber informasi</h3>
              <div className="mt-4">
                <Sources sources={food.sources} />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-xl">Catatan data</h3>
              <ul className="mt-4 space-y-3 font-sans text-xs text-cocoa-soft">
                <li className="flex items-center justify-between gap-3 border-b border-line pb-2">
                  <span>Status konten</span>
                  <span className="font-semibold text-cocoa">
                    {isDraft ? 'Draf' : 'Terverifikasi'}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3 border-b border-line pb-2">
                  <span>Status lokasi</span>
                  <span className="font-semibold text-cocoa">
                    {origin?.verificationStatus === 'verified' ? 'Terverifikasi' : 'Belum'}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Koordinat</span>
                  <span className="font-semibold text-cocoa">
                    {origin?.hasCoordinates ? 'Tersedia' : 'Belum tersedia'}
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Bahan */}
      {ingredients.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading
              eyebrow="Bahan pangan"
              title="Bahan yang tercatat"
              description="Bahan berikut terhubung dengan resep hidangan ini. Status verifikasinya mengikuti data bahan."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ingredients.map((ingredient) => (
                <Link
                  key={ingredient._id}
                  to={`/bahan/${ingredient.slug}`}
                  className="card-sm card-hover flex items-center gap-4 p-4"
                >
                  <img
                    src={mediaUrl(ingredient.image?.url) || '/assets/ingredients/placeholder.svg'}
                    alt={ingredient.name}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl border border-line object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/assets/ingredients/placeholder.svg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base leading-snug">{ingredient.name}</p>
                    <p className="mt-1 font-sans text-[11px] text-cocoa-soft">
                      {ingredient.originLocations?.map((item) => item.district).filter(Boolean).join(', ') ||
                        'Asal belum tercatat'}
                    </p>
                  </div>
                  <VerificationBadge status={ingredient.verificationStatus} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resep */}
      <section className="section bg-cream/40">
        <div className="container-page">
          <SectionHeading
            eyebrow="Resep"
            title="Cara memasak di rumah"
            description="Resep disajikan sebagai panduan bertahap. Resep draf wajib diverifikasi sebelum dijadikan acuan."
          />

          {recipes.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {recipes.map((item) => (
                <Link
                  key={item._id}
                  to={`/resep/${item._id}`}
                  className="card card-hover group flex flex-col p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {item.contentStatus === 'draft' && <DraftBadge />}
                    <span className="chip">{item.difficulty}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl group-hover:text-brick">
                    {item.title || `Resep ${food.name}`}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-4 font-sans text-xs text-cocoa-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="text-teal" />
                      {item.servings} porsi
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-teal" />
                      {formatMinutes(totalTime(item))}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Utensils size={13} className="text-teal" />
                      {item.ingredients?.length || 0} bahan
                    </span>
                  </div>
                  <span className="link-underline mt-5">
                    Buka resep
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card mt-8 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brick-soft text-brick">
                  <ChefHat size={22} />
                </span>
                <div>
                  <h3 className="font-display text-xl">Resep belum terdokumentasi</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-cocoa-soft">
                    Belum ada resep terverifikasi untuk hidangan ini. Kami tidak menampilkan resep
                    karangan; kirimkan resep keluarga Anda untuk ditinjau editor.
                  </p>
                </div>
              </div>
              <Link to="/kontribusi" className="btn-primary btn-sm shrink-0">
                Kirim resep
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Peta */}
      {mapMarkers.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading
              eyebrow="Lokasi"
              title="Titik asal di peta"
              description="Titik ini adalah data contoh tingkat kecamatan dan belum diverifikasi di lapangan."
              action={{ to: '/peta', label: 'Peta lengkap' }}
            />
            <div className="mt-8">
              <OriginMap markers={mapMarkers} mode="food" height="360px" />
            </div>
          </div>
        </section>
      )}

      {/* Video */}
      {videos.length > 0 && (
        <section className="section bg-cocoa text-cream-soft">
          <div className="container-page">
            <SectionHeading
              eyebrow="Multimedia"
              title="Dokumentasi terkait"
              description="Slot video untuk hidangan ini. Media resmi belum tentu tersedia."
              tone="light"
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Terkait */}
      {related.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading
              eyebrow="Rasa lain"
              title={`Lebih banyak ${food.category.toLowerCase()}`}
              action={{ to: `/jelajah?category=${encodeURIComponent(food.category)}`, label: 'Lihat kategori' }}
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <FoodCard key={item._id} food={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-page pb-4">
        <Link to="/jelajah" className="btn-outline btn-sm">
          <ArrowLeft size={14} />
          Kembali ke katalog
        </Link>
      </div>
    </>
  );
}

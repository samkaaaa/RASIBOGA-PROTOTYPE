import { useEffect, useMemo, useState } from 'react';
import { Camera, Clock3, Play, X } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import { formatSeconds } from '../../utils/format.js';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';

const FALLBACK_IMAGE = '/assets/food-placeholder.svg';
const TILE_SPANS = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1 md:col-span-4',
];

function videoDuration(video) {
  if (!video) return 'Segera';
  if (typeof video.duration === 'string' && video.duration.trim()) return video.duration;
  if (Number.isFinite(Number(video.duration)) && Number(video.duration) > 0) {
    return formatSeconds(video.duration);
  }
  return 'Video';
}

function buildTiles(foods, articles, videos) {
  const photos = [
    ...foods
      .filter((food) => food.mainImage?.url)
      .map((food) => ({
        id: `food-${food._id}`,
        type: 'image',
        src: mediaUrl(food.mainImage.url),
        title: food.name,
        subtitle: food.category || 'Foto arsip',
        alt: `Ilustrasi ${food.name}`,
      })),
    ...articles
      .filter((article) => article.coverImage)
      .map((article) => ({
        id: `article-${article._id}`,
        type: 'image',
        src: mediaUrl(article.coverImage),
        title: article.title,
        subtitle: article.category || 'Foto arsip',
        alt: article.title,
      })),
  ];

  const videoTiles = videos.map((video, index) => ({
    id: `video-${video._id || index}`,
    type: 'video',
    src: mediaUrl(video.thumbnail) || '/assets/videos/video-placeholder.svg',
    title: video.title || 'Dokumentasi video',
    subtitle: video.description || 'Video dokumentasi',
    alt: video.title || 'Dokumentasi video',
    duration: videoDuration(video),
    embedUrl: video.embedUrl,
    url: video.url,
  }));

  const tiles = [...photos.slice(0, 5), ...videoTiles.slice(0, 1)];

  if (!videoTiles.length) {
    tiles.push({
      id: 'video-slot',
      type: 'video',
      src: '/assets/videos/video-placeholder.svg',
      title: 'Slot video dokumentasi',
      subtitle: 'Video proses memasak segera hadir',
      alt: 'Slot video dokumentasi',
      duration: 'Segera',
      placeholder: true,
    });
  }

  while (tiles.length < 6) {
    tiles.push({
      id: `placeholder-${tiles.length}`,
      type: 'image',
      src: FALLBACK_IMAGE,
      title: 'Segera hadir',
      subtitle: 'Dokumentasi visual',
      alt: 'Ilustrasi piring kosong',
      placeholder: true,
    });
  }

  return tiles.slice(0, 6);
}

export default function MediaGallery({ foods = [], articles = [], videos = [], loading = false }) {
  const tiles = useMemo(() => buildTiles(foods, articles, videos), [foods, articles, videos]);
  const [activeTile, setActiveTile] = useState(null);

  useEffect(() => {
    if (!activeTile) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveTile(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeTile]);

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Dokumentasi visual"
          title="Galeri foto & video"
          description="Potongan visual dari arsip: hidangan, bahan, dan proses di baliknya. Klik untuk memperbesar."
          action={{ to: '/kontribusi', label: 'Kirim dokumentasi' }}
        />

        <div className="mt-10">
          {loading && !tiles.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[170px]">
              {TILE_SPANS.map((span, index) => (
                <div
                  key={index}
                  className={`${span} min-h-[140px] animate-pulse rounded-3xl border border-line bg-cream-deep`}
                />
              ))}
            </div>
          ) : (
            <div className="grid auto-rows-[140px] grid-cols-2 gap-4 md:auto-rows-[170px] md:grid-cols-4">
              {tiles.map((tile, index) => (
                <Reveal
                  key={tile.id}
                  delay={(index % 3) * 0.06}
                  className={`${TILE_SPANS[index]} min-h-0`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTile(tile)}
                    className="group relative h-full w-full overflow-hidden rounded-3xl border border-line bg-cream-deep text-left shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)]"
                  >
                    <img
                      src={tile.src}
                      alt={tile.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-cocoa/10 to-cocoa/10" />

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-cream-soft/40 bg-cream-soft/85 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.1em] text-cocoa backdrop-blur-sm">
                      {tile.type === 'video' ? (
                        <>
                          <Play size={10} className="text-brick" />
                          Video
                        </>
                      ) : (
                        <>
                          <Camera size={10} className="text-brick" />
                          Foto
                        </>
                      )}
                    </span>

                    {tile.type === 'video' && (
                      <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cream-soft/70 bg-cream-soft/90 text-brick shadow-[0_12px_28px_-16px_rgba(46,31,27,0.6)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                        <Play size={20} className="ml-0.5 fill-brick" />
                      </span>
                    )}

                    {tile.type === 'video' && (
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-cocoa/70 px-2 py-1 font-sans text-[9px] font-semibold text-cream-soft backdrop-blur-sm">
                        <Clock3 size={10} />
                        {tile.duration}
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="line-clamp-2 font-display text-lg leading-[1.15] text-cream-soft drop-shadow-[0_2px_8px_rgba(46,31,27,0.5)] sm:text-xl">
                        {tile.title}
                      </p>
                      <p className="mt-1 line-clamp-1 font-sans text-[10px] uppercase tracking-[0.1em] text-cream/70">
                        {tile.subtitle}
                      </p>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeTile && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-cocoa/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activeTile.title}
          onClick={() => setActiveTile(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-cream/20 bg-cream-soft shadow-[0_30px_80px_rgba(46,31,27,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveTile(null)}
              aria-label="Tutup pratinjau"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-cocoa/70 text-cream-soft backdrop-blur-sm transition-colors hover:bg-cocoa"
            >
              <X size={18} />
            </button>

            {activeTile.type === 'video' && activeTile.embedUrl ? (
              <div className="aspect-video w-full bg-cocoa">
                <iframe
                  src={activeTile.embedUrl}
                  title={activeTile.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : activeTile.type === 'video' && activeTile.url ? (
              <video src={activeTile.url} controls className="max-h-[75vh] w-full bg-cocoa" />
            ) : activeTile.type === 'video' ? (
              <div className="grid min-h-[280px] place-items-center bg-cream px-6 py-12 text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brick/10 text-brick">
                    <Play size={24} />
                  </span>
                  <p className="mt-4 font-display text-2xl text-cocoa">Video segera hadir</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-cocoa-soft">
                    Slot dokumentasi video sudah disiapkan. Kirim tautan video melalui halaman
                    kontribusi agar bisa ditinjau editor.
                  </p>
                </div>
              </div>
            ) : (
              <img
                src={activeTile.src}
                alt={activeTile.alt}
                className="max-h-[78vh] w-full bg-cocoa object-contain"
              />
            )}

            <div className="flex flex-col gap-1 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display text-lg text-cocoa">{activeTile.title}</p>
              <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-cocoa-soft">
                {activeTile.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

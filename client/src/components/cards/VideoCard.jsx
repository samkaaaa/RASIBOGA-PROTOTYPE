import { useEffect, useState } from 'react';
import { Play, Clock, Video, X } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';

const TYPE_LABELS = {
  youtube: 'YouTube',
  'uploaded-video': 'Video',
  animation: 'Animasi',
  lottie: 'Lottie',
};

/**
 * Renders a playable card when media exists, or an explicit "example slot"
 * when the collection is still empty (the honest state of the MVP).
 */
export default function VideoCard({ video, placeholder = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const thumbnail = mediaUrl(video?.thumbnail) || '/assets/videos/video-placeholder.svg';
  const title = video?.title || 'Slot video dokumentasi';
  const description =
    video?.description ||
    'Belum ada video resmi. Tambahkan tautan YouTube melalui dashboard admin setelah dokumentasi tersedia.';
  const playable = Boolean(video?.embedUrl || video?.url);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const body = (
    <>
      <div className="relative aspect-video overflow-hidden bg-cocoa">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-cocoa/35 transition-opacity group-hover:bg-cocoa/20" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brick/95 text-cream-soft shadow-[0_14px_30px_-14px_rgba(46,31,27,0.45)] transition-transform duration-300 group-hover:scale-110">
            <Play size={22} fill="currentColor" />
          </span>
        </span>
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-cocoa/70 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-cream-soft backdrop-blur">
          <Video size={11} />
          {TYPE_LABELS[video?.type] || 'Video'}
        </span>
        {placeholder && (
          <span className="absolute bottom-4 left-4 rounded-full bg-cream-soft/90 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-brick">
            Contoh slot
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 font-display text-lg leading-snug">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa-soft">{description}</p>
        <div className="mt-4 flex items-center gap-3 font-sans text-[11px] uppercase tracking-wider text-cocoa-faint">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {playable ? 'Tonton' : 'Segera'}
          </span>
          {video?.relatedFood?.name && <span>· {video.relatedFood.name}</span>}
        </div>
      </div>
    </>
  );

  const shell = `card card-hover group block w-full overflow-hidden text-left ${className}`;

  if (!playable) {
    return (
      <div className={shell} aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={shell} aria-label={`Putar video: ${title}`}>
        {body}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-cocoa/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-4 text-cream-soft">
              <h3 className="font-display text-lg sm:text-xl">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream/30 hover:bg-cream/10"
                aria-label="Tutup video"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-black shadow-[0_30px_60px_-30px_rgba(46,31,27,0.45)]">
              {video.embedUrl ? (
                <iframe
                  src={video.embedUrl}
                  title={title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={mediaUrl(video.url)} controls className="aspect-video w-full" />
              )}
            </div>
            <p className="mt-3 font-sans text-xs text-cream/60">
              Media contoh — ganti melalui dashboard admin.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

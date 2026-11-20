import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Info,
  PenLine,
} from 'lucide-react';
import { mediaUrl } from '../../services/api.js';

const FALLBACK_IMAGE = '/assets/food-placeholder.svg';
const EASE = 'cubic-bezier(.22,1,.36,1)';

const FALLBACK_FOOD = {
  _id: 'hero-placeholder',
  name: 'Arsip segera hadir',
  category: 'Kuliner Rembang',
  mainImage: { url: FALLBACK_IMAGE },
  originLocation: { district: 'Rembang', name: 'Kabupaten Rembang' },
  provenance: { label: 'Dokumentasi' },
  contentStatus: 'draft',
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    setReduced(query.matches);
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}

function locationLine(food) {
  const district =
    food?.originLocation?.district || food?.originLocation?.name || 'Kabupaten Rembang';
  const origin = food?.originLocation?.name;
  const detail = origin && origin !== district ? origin : food?.provenance?.label;
  return detail ? `${district} · ${detail}` : district;
}

/**
 * Stacked-card carousel for the hero. One active card sits in front, two cards
 * peek out behind it. Autoplay pauses on hover/focus and stops for good after
 * any manual interaction.
 */
export default function HeroCarousel({ foods = [], loading = false }) {
  const items = useMemo(
    () => (foods.length ? foods.slice(0, 6) : [FALLBACK_FOOD]),
    [foods]
  );
  const count = items.length;
  const reduced = usePrefersReducedMotion();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [progress, setProgress] = useState(0);

  const drag = useRef(null);
  const suppressClick = useRef(false);

  const goTo = useCallback(
    (nextIndex, manual = true) => {
      if (count < 1) return;
      setIndex(((nextIndex % count) + count) % count);
      setProgress(0);
      if (manual) setInteracted(true);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count < 2 || loading || paused || interacted || reduced) {
      setProgress(0);
      return undefined;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / 5000) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setProgress(0);
        setIndex((current) => (current + 1) % count);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [count, interacted, loading, paused, reduced, index]);

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY };
    suppressClick.current = false;
  };

  const onPointerUp = (event) => {
    if (!drag.current) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    drag.current = null;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) suppressClick.current = true;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) next();
      else previous();
    }
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const onClickCapture = (event) => {
    if (suppressClick.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  };

  if (loading && !foods.length) {
    return (
      <div className="mx-auto w-full max-w-[360px] nav:max-w-[380px] xl:max-w-[420px]">
        <div className="aspect-[4/5] animate-pulse rounded-3xl border border-line bg-cream-deep shadow-[0_24px_60px_rgba(46,31,27,0.12)]" />
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="h-10 w-24 animate-pulse rounded-full bg-cream-deep" />
          <div className="h-2 w-20 animate-pulse rounded-full bg-cream-deep" />
          <div className="h-4 w-16 animate-pulse rounded bg-cream-deep" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[360px] outline-none nav:max-w-[380px] xl:max-w-[420px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sorotan makanan Rembang"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClickCapture={onClickCapture}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Concentric decoration behind the deck */}
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/30 bg-pink/10" />
        <span className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/30 bg-pink/10" />
        <span className="absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink/30 bg-pink/10" />
      </div>

      <div className="relative mx-auto mb-8 aspect-[4/5] w-full">
        {items.map((food, itemIndex) => {
          const offset = (itemIndex - index + count) % count;
          const isActive = offset === 0;
          const isBack = offset === 1 || offset === 2;

          let transform = 'translate3d(-40px, 0, 0) scale(0.96) rotate(-4deg)';
          let opacity = 0;
          let zIndex = 0;

          if (reduced) {
            // Simple crossfade only: no rotation, offset, or zoom.
            transform = 'none';
            opacity = isActive ? 1 : 0;
            zIndex = isActive ? 30 : 0;
          } else if (isActive) {
            transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
            opacity = 1;
            zIndex = 30;
          } else if (offset === 1) {
            transform = 'translate3d(20px, 16px, 0) scale(0.93) rotate(2.4deg)';
            opacity = 0.9;
            zIndex = 20;
          } else if (offset === 2) {
            transform = 'translate3d(38px, 32px, 0) scale(0.86) rotate(4.8deg)';
            opacity = 0.55;
            zIndex = 10;
          }

          const verified =
            food.contentStatus === 'verified' ||
            food.originLocation?.verificationStatus === 'verified';
          const image = mediaUrl(food.mainImage?.url) || FALLBACK_IMAGE;

          return (
            <article
              key={food._id || itemIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`${itemIndex + 1} dari ${count}`}
              aria-hidden={!isActive}
              className="absolute inset-0"
              style={{
                transform,
                opacity,
                zIndex,
                pointerEvents: reduced
                  ? isActive
                    ? 'auto'
                    : 'none'
                  : isActive || isBack
                    ? 'auto'
                    : 'none',
                transition: reduced
                  ? `opacity 200ms ${EASE}`
                  : `transform 600ms ${EASE}, opacity 600ms ${EASE}`,
              }}
              onClick={
                isBack
                  ? (event) => {
                      event.preventDefault();
                      goTo(itemIndex);
                    }
                  : undefined
              }
            >
              <div
                className={`group/card relative h-full overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_24px_60px_rgba(46,31,27,0.18)] transition-[transform,box-shadow] duration-300 ${
                  isActive
                    ? 'hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(46,31,27,0.24)]'
                    : ''
                }`}
              >
                <img
                  src={image}
                  alt={`Ilustrasi ${food.name}`}
                  loading={itemIndex === 0 ? 'eager' : 'lazy'}
                  className={`h-full w-full object-cover transition-transform duration-[900ms] ${
                    isActive ? 'scale-100' : 'scale-[1.06]'
                  }`}
                  style={{ transitionTimingFunction: EASE }}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/45 via-cocoa/5 to-cocoa/15" />

                <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-pink/70 bg-pink/95 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-cocoa shadow-[0_6px_16px_-10px_rgba(46,31,27,0.35)]">
                  {food.category || 'Kuliner'}
                </span>

                <span
                  className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] shadow-[0_6px_16px_-10px_rgba(46,31,27,0.35)] backdrop-blur-md ${
                    verified
                      ? 'border-teal/25 bg-cream-soft/85 text-teal-dark'
                      : 'border-line bg-cream-soft/85 text-cocoa-soft'
                  }`}
                  title={verified ? 'Sumber sudah diverifikasi' : 'Konten masih berstatus draf'}
                >
                  {verified ? <BadgeCheck size={13} /> : <PenLine size={13} />}
                  {verified ? 'Terverifikasi' : 'Draf'}
                </span>

                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-cream-soft/70 bg-[rgba(255,250,245,0.75)] p-4 shadow-[0_12px_30px_-20px_rgba(46,31,27,0.45)] backdrop-blur-[14px]">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-display text-2xl font-semibold leading-[1.1] text-cocoa ${
                          isActive ? 'hero-caption-in' : 'opacity-0'
                        }`}
                      >
                        {food.name}
                      </p>
                      <p
                        className={`mt-1 truncate font-sans text-[13px] leading-relaxed text-cocoa-soft ${
                          isActive ? 'hero-caption-in-late' : 'opacity-0'
                        }`}
                      >
                        {locationLine(food)}
                      </p>
                    </div>

                    {food.slug ? (
                      <Link
                        to={`/makanan/${food.slug}`}
                        tabIndex={isActive ? 0 : -1}
                        aria-label={`Lihat detail ${food.name}`}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brick text-cream-soft shadow-[0_8px_20px_-10px_rgba(46,31,27,0.5)] transition-colors hover:bg-brick-dark"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brick/20 text-brick">
                        <ArrowUpRight size={18} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previous}
            aria-label="Sebelumnya"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-cream-soft text-cocoa transition-colors hover:border-brick/30 hover:text-brick"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Berikutnya"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-cream-soft text-cocoa transition-colors hover:border-brick/30 hover:text-brick"
          >
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="Pilih makanan sorotan">
          {items.map((food, itemIndex) => {
            const active = itemIndex === index;
            return (
              <button
                key={food._id || itemIndex}
                type="button"
                onClick={() => goTo(itemIndex)}
                aria-label={`Tampilkan ${food.name}`}
                aria-current={active ? 'true' : undefined}
                className="group/dot grid h-6 min-w-6 place-items-center"
              >
                <span
                  className={`relative block h-2 overflow-hidden rounded-full transition-all duration-500 ${
                    active
                      ? 'w-10 bg-brick/25'
                      : 'w-2 bg-cocoa/20 group-hover/dot:bg-brick/40'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-brick"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <p className="font-display text-sm font-semibold text-cocoa-soft">
          <span className="text-brick">{String(index + 1).padStart(2, '0')}</span>
          <span className="mx-1 text-cocoa/40">/</span>
          {String(count).padStart(2, '0')}
        </p>
      </div>

      <p className="mx-auto mt-4 flex w-fit max-w-full items-center justify-center gap-1.5 rounded-full border border-line bg-cream-soft/80 px-3 py-1.5 text-center font-sans text-[10px] font-medium tracking-wide text-cocoa-soft">
        <Info size={12} className="shrink-0 text-teal" />
        Konten bersumber: Draf &amp; terverifikasi ditandai
      </p>
    </div>
  );
}

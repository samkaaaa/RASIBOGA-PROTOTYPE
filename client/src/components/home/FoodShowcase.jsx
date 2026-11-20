import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, MapPin, PenLine } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { EmptyState, ErrorState } from '../common/States.jsx';

const FALLBACK_IMAGE = '/assets/food-placeholder.svg';

function FoodShowcaseCard({ food }) {
  const verified =
    food.contentStatus === 'verified' ||
    food.originLocation?.verificationStatus === 'verified';
  const district =
    food.originLocation?.district || food.originLocation?.name || 'Rembang';

  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_26px_60px_-34px_rgba(46,31,27,0.32)]">
      <Link to={`/makanan/${food.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
          <img
            src={mediaUrl(food.mainImage?.url) || FALLBACK_IMAGE}
            alt={`Ilustrasi ${food.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/35 via-transparent to-cocoa/10" />

          <span className="absolute left-3 top-3 inline-flex max-w-[70%] items-center rounded-full border border-pink/70 bg-pink/95 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase leading-tight tracking-[0.1em] text-cocoa">
            {food.category || 'Kuliner'}
          </span>

          <span
            className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.08em] backdrop-blur-md ${
              verified
                ? 'border-teal/25 bg-cream-soft/85 text-teal-dark'
                : 'border-line bg-cream-soft/85 text-cocoa-soft'
            }`}
            title={verified ? 'Sumber sudah diverifikasi' : 'Konten masih berstatus draf'}
          >
            {verified ? <BadgeCheck size={11} /> : <PenLine size={11} />}
            {verified ? 'Terverifikasi' : 'Draf'}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-display text-xl leading-[1.15] tracking-[-0.01em] text-cocoa transition-colors group-hover:text-brick">
            {food.name}
          </h3>
          <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-xs text-cocoa-soft">
            <MapPin size={13} className="shrink-0 text-brick" />
            {district}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <span className="truncate font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-cocoa-faint">
              {food.provenance?.label || 'Kuliner Rembang'}
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brick/10 text-brick transition-colors group-hover:bg-brick group-hover:text-cream-soft">
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)]"
        >
          <div className="aspect-[4/5] w-full animate-pulse bg-cream-deep" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-cocoa/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-cocoa/8" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-cocoa/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FoodShowcase({ foods = [], loading = false, error = null, onRetry }) {
  return (
    <section className="section border-y border-line bg-cream/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Katalog pilihan"
          title="Makanan yang layak dikenal"
          description="Delapan entri dari katalog kuliner Rembang. Buka kartu untuk membaca sejarah, bahan, dan resepnya."
          action={{ to: '/jelajah', label: 'Jelajahi katalog' }}
        />

        <div className="mt-10">
          {error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : loading && !foods.length ? (
            <ShowcaseSkeleton />
          ) : foods.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {foods.slice(0, 8).map((food, index) => (
                <Reveal key={food._id} delay={(index % 4) * 0.06} className="h-full">
                  <FoodShowcaseCard food={food} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Katalog sedang disiapkan"
              description="Entri makanan akan muncul di sini setelah dipublikasikan oleh editor."
              action={{ to: '/kontribusi', label: 'Kirim usulan makanan' }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

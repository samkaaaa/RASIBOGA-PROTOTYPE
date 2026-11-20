import { Link } from 'react-router-dom';
import { ArrowRight, Carrot, Clock, Gauge } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import { formatMinutes, totalTime } from '../../utils/format.js';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { EmptyState } from '../common/States.jsx';

const FALLBACK_IMAGE = '/assets/food-placeholder.svg';

function RecipeCard({ recipe }) {
  const name = recipe.title || recipe.food?.name || 'Resep Rembang';
  const minutes = totalTime(recipe);
  const ingredients = recipe.ingredients?.length || 0;

  return (
    <Link
      to={`/resep/${recipe._id}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_26px_60px_-34px_rgba(46,31,27,0.32)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        <img
          src={mediaUrl(recipe.food?.mainImage?.url) || FALLBACK_IMAGE}
          alt={`Ilustrasi ${name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/30 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-cream-soft/60 bg-cream-soft/90 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.1em] text-brick backdrop-blur-sm">
          <Gauge size={11} />
          {recipe.difficulty || 'Mudah'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cocoa-faint">
          {recipe.food?.category || 'Resep'}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-xl leading-[1.15] tracking-[-0.01em] text-cocoa transition-colors group-hover:text-brick">
          {name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 font-sans text-[11px] text-cocoa-soft">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} className="text-brick" />
            {formatMinutes(minutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Carrot size={13} className="text-teal" />
            {ingredients} bahan
          </span>
        </div>

        <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-brick px-3.5 py-2 font-sans text-xs font-semibold text-cream-soft transition-colors group-hover:bg-brick-dark">
          Lihat resep
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function RecipeSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="w-[78%] min-w-[78%] overflow-hidden rounded-3xl border border-line bg-cream sm:w-[46%] sm:min-w-[46%] lg:w-auto lg:min-w-0 lg:flex-1"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-cream-deep" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-cocoa/10" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-cocoa/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-cocoa/8" />
            <div className="h-8 w-full animate-pulse rounded-full bg-cocoa/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecipeRail({ recipes = [], loading = false }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Resep"
          title="Resep untuk dicoba di rumah"
          description="Langkah yang jelas, daftar bahan, dan mode memasak untuk menemani dapur Anda."
          action={{ to: '/jelajah', label: 'Cari resep lain' }}
        />

        <div className="mt-10">
          {loading && !recipes.length ? (
            <RecipeSkeleton />
          ) : recipes.length ? (
            <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
              {recipes.slice(0, 4).map((recipe, index) => (
                <Reveal
                  key={recipe._id}
                  delay={(index % 4) * 0.06}
                  className="w-[78%] min-w-[78%] shrink-0 snap-start sm:w-[46%] sm:min-w-[46%] lg:w-auto lg:min-w-0"
                >
                  <RecipeCard recipe={recipe} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Resep sedang dikumpulkan"
              description="Resep yang sudah ditinjau editor akan tampil di sini."
              action={{ to: '/kontribusi', label: 'Kirim resep' }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

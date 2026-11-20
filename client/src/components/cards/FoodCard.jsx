import { Link } from 'react-router-dom';
import { Bookmark, MapPin, ArrowUpRight } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import { useBookmarks } from '../../context/BookmarkContext.jsx';
import { ProvenanceBadge } from '../common/Badges.jsx';

export default function FoodCard({ food, showBookmark = true, className = '' }) {
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(food.slug);

  return (
    <article className={`card card-hover group relative overflow-hidden ${className}`}>
      <Link to={`/makanan/${food.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
          <img
            src={mediaUrl(food.mainImage?.url) || '/assets/food-placeholder.svg'}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.src = '/assets/food-placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/45 via-transparent to-transparent opacity-70" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-pink bg-pink/95 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cocoa shadow-[0_6px_18px_-12px_rgba(46,31,27,0.35)]">
              {food.category}
            </span>
          </div>

          <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-cream-soft/90 text-cocoa opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </div>

        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ProvenanceBadge type={food.provenance?.type} />
          </div>

          <h3 className="font-display text-xl leading-snug transition-colors group-hover:text-brick">
            {food.name}
          </h3>

          {food.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa-soft">{food.description}</p>
          )}

          {food.originLocation?.name && (
            <p className="mt-3 flex items-center gap-1.5 font-sans text-xs text-cocoa-soft">
              <MapPin size={13} className="text-teal" />
              {food.originLocation.name}
              {food.originLocation.district ? `, ${food.originLocation.district}` : ''}
            </p>
          )}
        </div>
      </Link>

      {showBookmark && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            toggle(food);
          }}
          aria-label={saved ? `Hapus ${food.name} dari simpanan` : `Simpan ${food.name}`}
          aria-pressed={saved}
          className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border transition-all ${
            saved
              ? 'border-brick bg-brick text-cream-soft'
              : 'border-cream/60 bg-cream-soft/85 text-cocoa hover:border-brick hover:text-brick'
          }`}
        >
          <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
        </button>
      )}
    </article>
  );
}

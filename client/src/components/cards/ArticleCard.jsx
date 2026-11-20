import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

export default function ArticleCard({ article, featured = false, className = '' }) {
  return (
    <article className={`card card-hover group overflow-hidden ${className}`}>
      <Link to={`/cerita/${article.slug}`} className="block h-full">
        <div className={`relative overflow-hidden bg-cream-deep ${featured ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}>
          <img
            src={mediaUrl(article.coverImage) || '/assets/articles/article-1.svg'}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-cream-soft/90 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-brick">
            {article.category}
          </span>
        </div>

        <div className="flex h-full flex-col p-5">
          <h3 className={`font-display leading-snug transition-colors group-hover:text-brick ${featured ? 'text-2xl' : 'text-xl'}`}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-cocoa-soft">{article.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-wider text-cocoa-faint">
              <CalendarDays size={12} />
              {formatDate(article.createdAt, { month: 'short' })}
            </span>
            <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-brick">
              Baca
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

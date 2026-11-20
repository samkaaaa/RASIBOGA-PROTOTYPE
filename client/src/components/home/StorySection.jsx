import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { EmptyState } from '../common/States.jsx';

const FALLBACK_IMAGE = '/assets/articles/article-1.svg';

function readMinutes(article) {
  const words = `${article?.excerpt || article?.title || ''}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 40));
}

function FeatureStory({ article }) {
  return (
    <Link
      to={article.slug ? `/cerita/${article.slug}` : '/cerita'}
      className="group grid overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_26px_60px_-34px_rgba(46,31,27,0.32)] lg:grid-cols-[1.05fr_0.95fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep lg:aspect-auto lg:min-h-[360px]">
        <img
          src={mediaUrl(article.coverImage) || FALLBACK_IMAGE}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/35 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-pink/70 bg-pink/95 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-cocoa">
          {article.category || 'Cerita'}
        </span>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="eyebrow">Cerita pilihan</p>
        <h3 className="mt-3 font-display text-3xl leading-[1.1] tracking-[-0.01em] text-cocoa transition-colors group-hover:text-brick sm:text-[2.1rem]">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-cocoa-soft">
          {article.excerpt || 'Catatan tentang rasa, sumber, dan praktik dokumentasi kuliner Rembang.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="btn-primary btn-sm">
            Baca cerita
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans text-xs text-cocoa-soft">
            <Clock3 size={13} className="text-brick" />
            {readMinutes(article)} menit baca
          </span>
        </div>
      </div>
    </Link>
  );
}

function SmallStory({ article }) {
  return (
    <Link
      to={article.slug ? `/cerita/${article.slug}` : '/cerita'}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_26px_60px_-34px_rgba(46,31,27,0.32)] sm:flex-row"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep sm:aspect-auto sm:w-40 sm:shrink-0">
        <img
          src={mediaUrl(article.coverImage) || FALLBACK_IMAGE}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-brick">
          {article.category || 'Cerita'}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-xl leading-[1.15] tracking-[-0.01em] text-cocoa transition-colors group-hover:text-brick">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa-soft">
          {article.excerpt || 'Catatan budaya kuliner Rembang.'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5 font-sans text-[11px] text-cocoa-soft">
            <Clock3 size={12} className="text-brick" />
            {readMinutes(article)} menit
          </span>
          <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-brick">
            Baca cerita
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function StorySection({ articles = [], loading = false }) {
  const [feature, ...rest] = articles;
  const smallStories = rest.slice(0, 2);

  while (smallStories.length < 2) {
    smallStories.push({
      _id: `story-placeholder-${smallStories.length}`,
      title: 'Cerita segera hadir',
      excerpt: 'Catatan budaya dan proses dokumentasi sedang disiapkan oleh tim editorial.',
      coverImage: FALLBACK_IMAGE,
      category: 'Cerita',
      slug: '',
    });
  }

  return (
    <section className="section border-y border-line bg-cream/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cerita & budaya"
          title="Di balik sepiring hidangan"
          description="Catatan tentang sumber, praktik dokumentasi, dan ingatan yang melekat pada rasa."
          action={{ to: '/cerita', label: 'Semua cerita' }}
        />

        <div className="mt-10 space-y-5">
          {loading && !articles.length ? (
            <>
              <div className="h-[360px] animate-pulse rounded-3xl border border-line bg-cream-deep" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="h-48 animate-pulse rounded-3xl border border-line bg-cream-deep" />
                <div className="h-48 animate-pulse rounded-3xl border border-line bg-cream-deep" />
              </div>
            </>
          ) : feature ? (
            <>
              <Reveal>
                <FeatureStory article={feature} />
              </Reveal>
              <div className="grid gap-5 sm:grid-cols-2">
                {smallStories.map((article, index) => (
                  <Reveal key={article._id} delay={index * 0.08} className="h-full">
                    <SmallStory article={article} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Cerita sedang disiapkan"
              description="Catatan budaya akan tampil di sini setelah ditinjau editor."
              action={{ to: '/kontribusi', label: 'Kirim cerita' }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

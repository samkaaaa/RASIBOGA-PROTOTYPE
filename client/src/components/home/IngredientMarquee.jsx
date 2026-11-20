import { Sprout } from 'lucide-react';

const FALLBACK_NAMES = ['Kelapa', 'Bawang Merah', 'Asam Jawa', 'Gula Jawa', 'Ikan Laut'];

function IngredientChips({ names }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pr-2">
      {names.map((name, index) => (
        <span
          key={`${name}-${index}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-cream-soft px-3 py-1.5 font-sans text-xs text-cocoa-soft shadow-[0_8px_20px_-18px_rgba(46,31,27,0.35)]"
        >
          <Sprout size={12} className="text-teal" />
          {name}
        </span>
      ))}
    </div>
  );
}

export default function IngredientMarquee({ ingredients = [] }) {
  const names = ingredients.map((ingredient) => ingredient.name).filter(Boolean);
  const list = names.length ? names : FALLBACK_NAMES;

  return (
    <section className="border-y border-line bg-cream py-8 lg:py-10" aria-label="Bahan lokal Rembang">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <p className="eyebrow">Bahan asli daerah</p>
            <p className="mt-1 font-display text-lg leading-tight text-cocoa">Dari dapur Rembang</p>
          </div>

          <div className="marquee-mask relative min-w-0 flex-1 overflow-hidden">
            <div className="marquee-track flex w-max items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
              <IngredientChips names={list} />
              <div aria-hidden="true" className="motion-reduce:hidden">
                <IngredientChips names={list} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

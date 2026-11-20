import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import Reveal from '../common/Reveal.jsx';

export default function ContributionCTA() {
  return (
    <section className="container-page py-12 lg:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-brick px-6 py-12 text-cream-soft shadow-[0_24px_60px_-34px_rgba(46,31,27,0.5)] sm:px-10 sm:py-14 lg:px-14">
          <div className="ornament pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-cream/20" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-cream/15" aria-hidden="true" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/75">
                <HeartHandshake size={14} />
                Kontribusi komunitas
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.1] tracking-[-0.01em] text-cream-soft sm:text-4xl">
                Punya resep atau cerita dari Rembang?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/80">
                Kirimkan usulan melalui formulir kontribusi. Setiap kiriman ditinjau editor sebelum
                dipublikasikan, dan sumbernya selalu dicantumkan.
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                to="/kontribusi"
                className="btn bg-cream-soft text-brick shadow-[0_14px_30px_-18px_rgba(46,31,27,0.6)] hover:bg-cream"
              >
                Kirim Kontribusi
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

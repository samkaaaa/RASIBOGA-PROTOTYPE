import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'rasiboga:intro:v1';

export function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Immersive intro overlay. Shown once per browser session on the homepage.
 * Skip button, Escape key and prefers-reduced-motion are all supported.
 */
export default function IntroExperience({ onFinish }) {
  const overlayRef = useRef(null);
  const markRef = useRef(null);
  const titleRef = useRef(null);
  const storyRef = useRef(null);
  const ctaRef = useRef(null);
  const [leaving, setLeaving] = useState(false);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }

    const overlay = overlayRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!overlay || reduced) {
      onFinish();
      return;
    }

    gsap.to(overlay, {
      opacity: 0,
      filter: 'blur(16px)',
      scale: 1.02,
      duration: 0.75,
      ease: 'power2.inOut',
      onComplete: onFinish,
    });
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timeline;

    if (!reduced) {
      const context = gsap.context(() => {
        timeline = gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(markRef.current, { opacity: 0, scale: 0.7, rotate: -12, duration: 1 })
          .from(titleRef.current, { opacity: 0, y: 18, letterSpacing: '0.5em', duration: 0.9 }, '-=0.5')
          .from(storyRef.current?.children || [], { opacity: 0, y: 14, duration: 0.7, stagger: 0.16 }, '-=0.35')
          .from(ctaRef.current, { opacity: 0, y: 12, duration: 0.6 }, '-=0.2');
      }, overlayRef);

      return () => {
        document.body.style.overflow = '';
        timeline?.kill();
        context.revert();
      };
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden bg-cocoa px-6 text-cream-soft"
      role="dialog"
      aria-modal="true"
      aria-label="Pembuka RASIBOGA"
    >
      <div className="ornament pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brick/25 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-teal/20 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <div className="relative grid h-32 w-32 place-items-center sm:h-36 sm:w-36">
          <span className="absolute inset-3 rounded-full bg-cream/10 blur-2xl" aria-hidden="true" />
          <img
            ref={markRef}
            src="/assets/rasiboga-mascot.png"
            alt="Logo RASIBOGA"
            width="144"
            height="160"
            className="relative h-24 w-auto object-contain drop-shadow-[0_20px_40px_rgba(46,31,27,0.55)] sm:h-28"
          />
        </div>

        <p className="mt-7 font-sans text-[10px] uppercase tracking-[0.4em] text-cream/50">
          Kabupaten Rembang · Jawa Tengah
        </p>

        <h1
          ref={titleRef}
          className="mt-3 font-display text-4xl tracking-[0.22em] text-cream-soft sm:text-6xl"
        >
          RASIBOGA
        </h1>

        <div ref={storyRef} className="mt-8 space-y-4">
          <p className="font-display text-xl leading-relaxed text-cream/90 sm:text-2xl">
            Rasa yang tersimpan,<br className="sm:hidden" /> cerita yang dirawat.
          </p>
          <p className="mx-auto max-w-md font-sans text-sm leading-relaxed text-cream/60">
            Menjelajah kuliner Rembang: makanan, resep, asal-usul bahan, dan cerita budaya dalam satu
            arsip digital.
          </p>
        </div>

        <div ref={ctaRef} className="mt-10 flex flex-col items-center gap-4">
          <button type="button" onClick={finish} className="btn-primary group px-7 py-3.5">
            Masuk ke Rasiboga
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={finish}
            className="font-sans text-[11px] uppercase tracking-[0.24em] text-cream/40 transition-colors hover:text-cream/70"
          >
            Lewati intro
          </button>
        </div>
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center font-sans text-[10px] uppercase tracking-[0.3em] text-cream/25">
        Arsip kuliner digital
      </p>
    </div>
  );
}

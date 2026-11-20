import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/format.js';

function StatCounter({ value, label, Icon, isLast, divider }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (started.current) {
      setDisplay(Number(value) || 0);
      return undefined;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      started.current = true;
      setDisplay(Number(value) || 0);
      return undefined;
    }

    let frame = 0;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.unobserve(entry.target);

          const target = Number(value) || 0;
          const duration = 1500;
          const start = performance.now();

          const tick = (now) => {
            if (cancelled) return;
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(target * eased));
            if (progress < 1) frame = window.requestAnimationFrame(tick);
          };

          frame = window.requestAnimationFrame(tick);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center px-3 py-2 text-center sm:px-4 ${
        isLast ? 'col-span-2 sm:col-span-1' : ''
      } ${divider ? 'lg:border-l lg:border-line' : ''}`}
    >
      <Icon size={20} className="text-brick" aria-hidden="true" />
      <dt className="order-2 mt-2 max-w-[150px] font-sans text-[10px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-cocoa-soft sm:text-[11px]">
        {label}
      </dt>
      <dd className="order-1 mt-3 font-display text-[36px] font-semibold leading-none tracking-[-0.01em] text-brick sm:text-[44px]">
        {formatNumber(display)}
      </dd>
    </div>
  );
}

/**
 * Five archive counters. Every number is supplied by the page from live API
 * metadata; nothing here is hard-coded.
 */
export default function StatsStrip({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="border-y border-line bg-cream" aria-label="Ringkasan arsip">
      <div className="container-page py-8 sm:py-10">
        <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-0">
          {items.map((item, index) => (
            <StatCounter
              key={item.label}
              value={item.value}
              label={item.label}
              Icon={item.icon}
              isLast={index === items.length - 1}
              divider={index > 0}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Scroll reveal built on IntersectionObserver.
 *
 * The wrapper is visible by default so content can never be stranded at
 * `opacity: 0` when JavaScript, the observer, or the animation is unavailable.
 * Once mounted we arm the hidden state, observe the element, and reveal it the
 * first time it enters the viewport. `rootMargin` trims the bottom 10% so the
 * animation starts just before the element reaches the fold.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className = '',
  as: Tag = 'div',
  style,
}) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') return undefined;

    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);

    // Safety net: never leave content invisible if the observer never fires.
    const fallback = window.setTimeout(() => setVisible(true), 5000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const mergedStyle = {
    '--reveal-delay': `${Math.min(Math.max(delay, 0), 0.5)}s`,
    '--reveal-y': `${y}px`,
    ...style,
  };

  return (
    <Tag
      ref={ref}
      className={`reveal ${armed ? 'reveal--armed' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={mergedStyle}
    >
      {children}
    </Tag>
  );
}

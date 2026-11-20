import { useCallback, useEffect, useRef, useState } from 'react';
import './IntroSplash.css';

const STORAGE_KEY = 'rasi-boga:splash:v1';
const NORMAL_DURATION = 5600;
const REDUCED_DURATION = 900;

function hasSeenSplash() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* private mode / disabled storage — the in-memory state still hides it */
  }
}

/**
 * First-load splash for Rasi Boga. All motion is CSS keyframes; React only
 * handles session persistence, scroll locking, reduced-motion duration and the
 * skip button.
 */
export default function IntroSplash() {
  const [open, setOpen] = useState(() => !hasSeenSplash());
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    markSplashSeen();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(finish, reduced ? REDUCED_DURATION : NORMAL_DURATION);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, reduced, finish]);

  if (!open) return null;

  return (
    <div className={`intro-splash${reduced ? ' intro-splash--reduced' : ''}`}>
      <div className="intro-splash__stage" role="img" aria-label="Rasi Boga">
        <div className="intro-splash__glow" aria-hidden="true" />

        <div className="intro-splash__group">
          <img
            className="intro-splash__emblem"
            src="/assets/logo-emblem.png"
            alt=""
            width="1024"
            height="1169"
          />

          <span className="intro-splash__wordmark">
            <img
              className="intro-splash__wordmark-img"
              src="/assets/logo-wordmark.png"
              alt=""
              width="3820"
              height="497"
            />
          </span>

          <span className="intro-splash__line" aria-hidden="true" />
        </div>
      </div>

      <button type="button" className="intro-splash__skip" onClick={finish} aria-label="Lewati intro">
        Lewati
      </button>
    </div>
  );
}

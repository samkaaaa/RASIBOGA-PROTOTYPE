import { Link } from 'react-router-dom';

/**
 * Brand lockup built from the supplied remove-background logo.
 * Light surfaces use the original artwork; dark surfaces (footer, admin rail,
 * login aside) use the same artwork with inverted tones so the dark wordmark
 * stays readable without any background panel or cream chip.
 */
export default function Logo({ to = '/', compact = false, tone = 'dark', className = '' }) {
  const isDarkSurface = tone === 'light';
  const src = isDarkSurface
    ? '/assets/logo-rasiboga-navbar-light.png'
    : '/assets/logo-rasiboga-navbar.png';
  const imageClass = compact
    ? 'h-9 w-auto object-contain'
    : isDarkSurface
      ? 'h-9 w-auto object-contain sm:h-10'
      : 'h-10 w-auto object-contain sm:h-11';

  const content = (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={src}
        alt="RASIBOGA — Warisan Rasa Rembang"
        width="737"
        height="203"
        className={imageClass}
      />
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex">
      {content}
    </Link>
  );
}

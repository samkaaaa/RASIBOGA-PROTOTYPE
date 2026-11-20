import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  tone = 'dark',
  className = '',
}) {
  const isCenter = align === 'center';
  const titleColor = tone === 'light' ? 'text-cream-soft' : 'text-cocoa';
  const descColor = tone === 'light' ? 'text-cream/75' : 'text-cocoa-soft';

  return (
    <div
      className={`flex flex-col gap-5 ${
        isCenter ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={`max-w-2xl ${isCenter ? 'mx-auto' : ''}`}>
        {eyebrow && (
          <p className={`eyebrow mb-3 ${tone === 'light' ? 'text-cream/70' : ''}`}>{eyebrow}</p>
        )}
        <h2 className={`display-2 ${titleColor}`}>{title}</h2>
        {description && (
          <p className={`mt-4 text-[1.02rem] leading-relaxed ${descColor}`}>{description}</p>
        )}
      </div>

      {action?.to && (
        <Link to={action.to} className={`link-underline shrink-0 ${tone === 'light' ? 'text-cream' : ''}`}>
          {action.label}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

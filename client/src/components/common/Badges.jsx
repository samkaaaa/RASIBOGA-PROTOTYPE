import { BadgeCheck, CircleAlert, PenLine } from 'lucide-react';
import { PROVENANCE_LABELS } from '../../utils/constants.js';

export function ProvenanceBadge({ type, className = '' }) {
  if (!type) return null;
  const styles = {
    local: 'border-brick/25 bg-brick-soft/80 text-brick-dark',
    adaptation: 'border-teal/25 bg-teal-soft text-teal-dark',
    general: 'border-line bg-cream-soft/80 text-cocoa-soft',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[11px] font-semibold tracking-wide ${styles[type] || styles.general} ${className}`}
    >
      {PROVENANCE_LABELS[type] || type}
    </span>
  );
}

export function VerificationBadge({ status, className = '' }) {
  const verified = status === 'verified';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[11px] font-medium ${
        verified
          ? 'border-teal/25 bg-teal-soft text-teal-dark'
          : 'border-line bg-cream-soft text-cocoa-soft'
      } ${className}`}
    >
      {verified ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}
      {verified ? 'Terverifikasi' : 'Belum terverifikasi'}
    </span>
  );
}

export function DraftBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-soft px-3 py-1 font-sans text-[11px] font-medium text-cocoa-soft ${className}`}
      title="Konten belum diverifikasi narasumber"
    >
      <PenLine size={13} />
      Konten draf
    </span>
  );
}

export function CategoryBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-cocoa/85 px-3 py-1 font-sans text-[11px] font-medium tracking-wide text-cream-soft ${className}`}
    >
      {children}
    </span>
  );
}

import { Link } from 'react-router-dom';
import { Sprout, TriangleAlert, RotateCcw } from 'lucide-react';

export function EmptyState({
  icon: Icon = Sprout,
  title = 'Belum ada data',
  description = 'Konten untuk bagian ini belum tersedia.',
  action,
  className = '',
}) {
  return (
    <div className={`card flex flex-col items-center px-6 py-14 text-center ${className}`}>
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cream-deep text-brick">
        <Icon size={24} />
      </span>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-cocoa-soft">{description}</p>
      {action?.to && (
        <Link to={action.to} className="btn-primary btn-sm mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`card flex flex-col items-center px-6 py-14 text-center ${className}`}>
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brick-soft text-brick">
        <TriangleAlert size={24} />
      </span>
      <h3 className="font-display text-xl">Tidak dapat memuat data</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-cocoa-soft">
        {message || 'Terjadi kesalahan saat menghubungi server.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline btn-sm mt-6">
          <RotateCcw size={14} />
          Coba lagi
        </button>
      )}
    </div>
  );
}

import { Loader2 } from 'lucide-react';

export function Loading({ label = 'Memuat data…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-cocoa-soft ${className}`}>
      <Loader2 className="animate-spin text-brick" size={20} />
      <span className="font-sans text-sm">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-[4/3] w-full bg-cocoa/8" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-cocoa/10" />
        <div className="h-5 w-3/4 rounded bg-cocoa/10" />
        <div className="h-3 w-full rounded bg-cocoa/8" />
        <div className="h-3 w-2/3 rounded bg-cocoa/8" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

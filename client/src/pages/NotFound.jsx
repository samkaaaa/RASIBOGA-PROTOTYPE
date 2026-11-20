import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] items-center justify-center py-20">
      <div className="card max-w-lg px-8 py-14 text-center">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-brick">
          Halaman 404
        </p>
        <h1 className="mt-4 font-display text-4xl">Rasa yang Anda cari belum tercatat.</h1>
        <p className="mt-4 text-sm leading-relaxed text-cocoa-soft">
          Tautan mungkin sudah berubah atau konten belum dipublikasikan. Coba mulai dari katalog
          atau peta gastronomi.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home size={16} />
            Beranda
          </Link>
          <Link to="/jelajah" className="btn-outline">
            <Search size={16} />
            Jelajah katalog
          </Link>
          <Link to="/peta" className="btn-ghost">
            <Compass size={16} />
            Peta
          </Link>
        </div>
      </div>
    </section>
  );
}

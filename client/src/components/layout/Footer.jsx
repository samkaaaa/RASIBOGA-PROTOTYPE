import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, Youtube } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { NAV_LINKS } from '../../utils/constants.js';

const exploreLinks = [
  { to: '/jelajah', label: 'Jelajah Rasa' },
  { to: '/peta', label: 'Peta Gastronomi' },
  { to: '/cerita', label: 'Cerita & Budaya' },
  { to: '/glosarium', label: 'Glosarium' },
];

const participateLinks = [
  { to: '/kontribusi', label: 'Kirim Kontribusi' },
  { to: '/simpanan', label: 'Simpanan Saya' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-cocoa text-cream-soft">
      <div className="ornament pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="container-page relative py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
              Platform dokumentasi digital warisan kuliner Kabupaten Rembang. Menghubungkan makanan,
              resep, asal-usul bahan, dan cerita budaya dalam satu tempat.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-sans text-xs text-cream/55">
              <MapPin size={14} className="text-teal" />
              Kabupaten Rembang, Jawa Tengah, Indonesia
            </p>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/50">
              Jelajahi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="font-sans text-sm text-cream/75 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/50">
              Partisipasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {participateLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="font-sans text-sm text-cream/75 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/50">
              Kontak
            </h3>
            <ul className="mt-4 space-y-3 font-sans text-sm text-cream/75">
              <li className="inline-flex items-center gap-2">
                <Mail size={14} className="text-teal" />
                halo@rasiboga.local
              </li>
              <li className="inline-flex items-center gap-2">
                <Instagram size={14} className="text-teal" />
                @rasiboga
              </li>
              <li className="inline-flex items-center gap-2">
                <Youtube size={14} className="text-teal" />
                RASIBOGA
              </li>
            </ul>
            <p className="mt-5 font-sans text-[11px] leading-relaxed text-cream/40">
              Kontak contoh — ganti dengan kanal resmi.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[11px] text-cream/45">
            © {new Date().getFullYear()} RASIBOGA. Konten budaya wajib mencantumkan sumber.
          </p>
          <p className="inline-flex items-center gap-1.5 font-sans text-[11px] text-cream/45">
            Dibangun sebagai MVP MERN
            <ArrowUpRight size={12} />
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bookmark, Menu, Search, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { NAV_LINKS } from '../../utils/constants.js';
import { useBookmarks } from '../../context/BookmarkContext.jsx';

const MENU_LINKS = NAV_LINKS.filter((link) => link.to !== '/kontribusi');

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { count } = useBookmarks();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative inline-flex items-center py-2 font-sans text-[12.5px] font-medium tracking-wide transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-brick after:transition-transform after:duration-200 xl:text-[13px] ${
      isActive
        ? 'text-brick after:scale-x-100'
        : 'text-cocoa/80 after:scale-x-0 hover:text-brick hover:after:scale-x-100'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 h-[72px] bg-[rgba(255,250,245,0.85)] backdrop-blur-[10px] transition-shadow duration-300 ${
        scrolled
          ? 'border-b border-line shadow-[0_10px_30px_-24px_rgba(46,31,27,0.35)]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="container-page grid h-full grid-cols-[auto_1fr_auto] items-center gap-4">
        <Logo />

        <nav className="hidden items-center justify-center gap-3 nav:flex xl:gap-8" aria-label="Navigasi utama">
          {MENU_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <Link
            to="/jelajah"
            className="grid h-10 w-10 place-items-center rounded-full text-cocoa/80 transition-colors hover:bg-brick/5 hover:text-brick"
            aria-label="Cari makanan"
          >
            <Search size={18} />
          </Link>

          <Link
            to="/simpanan"
            className="relative grid h-10 w-10 place-items-center rounded-full text-cocoa/80 transition-colors hover:bg-brick/5 hover:text-brick"
            aria-label={`Simpanan saya (${count})`}
          >
            <Bookmark size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brick px-1 font-sans text-[9px] font-bold text-cream-soft">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          <Link to="/kontribusi" className="btn-primary btn-sm ml-1 hidden nav:inline-flex">
            Kontribusi
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-cocoa/80 transition-colors hover:bg-brick/5 hover:text-brick nav:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-line bg-cream shadow-[0_24px_50px_-30px_rgba(46,31,27,0.35)] nav:hidden"
        >
          <nav className="container-page flex flex-col py-4" aria-label="Navigasi seluler">
            {MENU_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `border-b border-line py-3 font-sans text-sm font-medium ${
                    isActive ? 'text-brick' : 'text-cocoa/80'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-3 pt-4">
              <Link to="/simpanan" className="btn-outline btn-sm flex-1">
                <Bookmark size={14} /> Simpanan ({count})
              </Link>
              <Link to="/kontribusi" className="btn-primary btn-sm flex-1">
                Kontribusi
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChefHat,
  ExternalLink,
  FolderTree,
  Image,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../common/Logo.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/makanan', label: 'Makanan', icon: UtensilsCrossed },
  { to: '/admin/resep', label: 'Resep', icon: ChefHat },
  { to: '/admin/bahan', label: 'Bahan', icon: Leaf },
  { to: '/admin/lokasi', label: 'Lokasi', icon: MapPin },
  { to: '/admin/video', label: 'Video', icon: Image },
  { to: '/admin/artikel', label: 'Artikel', icon: BookOpen },
  { to: '/admin/kategori', label: 'Kategori', icon: FolderTree },
  { to: '/admin/kontribusi', label: 'Kontribusi', icon: MessageSquare },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil keluar.');
    navigate('/admin/login', { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center border-b border-cream/10 px-5">
        <Logo tone="light" compact />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi admin">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-brick text-cream-soft'
                      : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                  }`
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-cream/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-sans text-[12px] text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <ExternalLink size={15} />
          Lihat situs publik
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-sans text-[12px] text-cream/60 transition-colors hover:bg-brick/30 hover:text-cream"
        >
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-soft">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-cocoa lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[1500] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu admin"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-cocoa shadow-[0_30px_60px_-30px_rgba(46,31,27,0.55)]">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-cream-soft/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full text-cocoa hover:bg-cocoa/5 lg:hidden"
                aria-label="Buka menu admin"
              >
                <Menu size={19} />
              </button>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-faint">
                  Dashboard editor
                </p>
                <p className="font-display text-base leading-tight text-cocoa">
                  {NAV.find((item) =>
                    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
                  )?.label || 'Admin'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="font-sans text-xs font-semibold text-cocoa">{admin?.name}</p>
                <p className="font-sans text-[10px] text-cocoa-faint">{admin?.email}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brick font-display text-sm text-cream-soft">
                {(admin?.name || 'A').charAt(0).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full text-cocoa/60 hover:bg-cocoa/5 hover:text-brick lg:hidden"
                aria-label="Keluar"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

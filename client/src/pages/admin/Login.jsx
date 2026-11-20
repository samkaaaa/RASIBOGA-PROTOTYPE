import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../components/common/Logo.jsx';

export default function AdminLogin() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && admin) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Selamat datang kembali.');
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Gagal masuk.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('admin@rasiboga.local');
    setPassword('GantiSayaSegera123!');
    setError('');
  };

  return (
    <div className="grid min-h-screen bg-cream-soft lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-cocoa p-12 text-cream-soft lg:flex lg:flex-col lg:justify-between">
        <div className="ornament pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-1/4 h-80 w-80 rounded-full bg-brick/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-16 top-16 h-72 w-72 rounded-full bg-teal/20 blur-[90px]" />

        <div className="relative">
          <Logo tone="light" />
          <p className="mt-16 max-w-md font-display text-4xl leading-tight">
            Ruang kerja editor untuk merawat arsip rasa Rembang.
          </p>
          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-cream/60">
            Kelola makanan, resep, bahan, lokasi, video, artikel, dan kontribusi komunitas. Setiap
            perubahan dapat ditinjau sebelum dipublikasikan.
          </p>
        </div>

        <div className="relative rounded-2xl border border-cream/15 bg-cream/5 p-5">
          <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/70">
            <ShieldCheck size={14} className="text-teal" />
            Catatan keamanan
          </p>
          <p className="mt-2 font-sans text-xs leading-relaxed text-cream/55">
            Kredensial demo hanya untuk pengembangan lokal. Ganti kata sandi dan JWT_SECRET sebelum
            men-deploy aplikasi ke lingkungan publik.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>

          <p className="mt-10 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-brick lg:mt-0">
            Akses editor
          </p>
          <h1 className="mt-3 font-display text-4xl text-cocoa">Masuk ke dashboard</h1>
          <p className="mt-3 font-sans text-sm leading-relaxed text-cocoa-soft">
            Gunakan akun admin yang tercantum pada berkas <code className="rounded bg-cream px-1.5 py-0.5 text-[11px]">README.md</code>{' '}
            atau variabel lingkungan server.
          </p>

          {import.meta.env.DEV && (
            <div className="mt-5 rounded-2xl border border-line bg-cream px-4 py-3">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-dark">
                Akun demo lokal
              </p>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-cocoa-soft">
                <span className="font-semibold text-cocoa">admin@rasiboga.local</span>
                <br />
                <span className="font-semibold text-cocoa">GantiSayaSegera123!</span>
              </p>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="mt-2 font-sans text-[11px] font-semibold text-brick underline decoration-brick/30 underline-offset-4 hover:text-brick-dark"
              >
                Isi otomatis
              </button>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="label">Email</span>
              <span className="relative block">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-faint"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                  placeholder="admin@rasiboga.local"
                  className="input h-12 pl-10"
                />
              </span>
            </label>

            <label className="block">
              <span className="label">Kata sandi</span>
              <span className="relative block">
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-faint"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder="Minimal 8 karakter"
                  className="input h-12 pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-cocoa-faint hover:bg-cocoa/5 hover:text-cocoa"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {error && (
              <p className="rounded-xl border border-brick/20 bg-brick-soft/60 px-4 py-3 font-sans text-xs text-brick-dark">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary h-12 w-full">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-sans text-xs text-cocoa-soft hover:text-brick"
            >
              <ArrowLeft size={13} />
              Kembali ke situs
            </Link>
            <Link
              to="/kontribusi"
              className="font-sans text-xs text-cocoa-soft hover:text-brick"
            >
              Kirim kontribusi publik
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

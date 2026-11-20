import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Image,
  Info,
  KeyRound,
  Server,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import { Loading } from '../../components/common/Loading.jsx';
import { ErrorState } from '../../components/common/States.jsx';
import { formatDate } from '../../utils/format.js';

function ConfigRow({ label, value, ok, detail }) {
  return (
    <div className="flex items-start gap-3 border-t border-line py-3 first:border-0 first:pt-0 last:pb-0">
      <span className="mt-0.5 shrink-0">
        {ok ? (
          <CheckCircle2 size={16} className="text-teal-dark" />
        ) : (
          <XCircle size={16} className="text-cocoa-faint" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-xs font-semibold text-cocoa">{label}</p>
        <p className="mt-0.5 break-words font-sans text-[11px] text-cocoa-soft">{value}</p>
        {detail && <p className="mt-0.5 font-sans text-[10px] text-cocoa-faint">{detail}</p>}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { data, loading, error, reload } = useAsync(() => adminApi.settings(), []);

  const site = data?.site || {};
  const runtime = data?.runtime || {};
  const admin = data?.admin || {};
  const demoAccount = /@rasiboga\.local$/i.test(admin.email || '');

  return (
    <>
      <AdminPageHeader
        eyebrow="Sistem"
        title="Pengaturan & kesiapan"
        description="Ringkasan konfigurasi situs dan server. Nilai sensitif seperti URI basis data dan kunci API tidak pernah dikirim ke browser."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading label="Memuat pengaturan…" />
      ) : (
        <div className="space-y-5">
          {demoAccount && (
            <div className="flex items-start gap-3 rounded-2xl border border-brick/25 bg-brick-soft/60 px-4 py-3.5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brick" />
              <div>
                <p className="font-sans text-xs font-semibold text-brick-dark">
                  Akun demo masih aktif
                </p>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-cocoa">
                  Anda masuk dengan akun seed bawaan. Sebelum situs dipublikasikan, buat akun admin
                  baru dengan kata sandi kuat dan hapus akun demo{' '}
                  <span className="font-mono">{admin.email}</span>.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg text-cocoa">
                <Info size={17} className="text-brick" />
                Identitas situs
              </h2>
              <dl className="mt-4 space-y-3">
                {[
                  ['Nama', site.name],
                  ['Tagline', site.tagline],
                  ['Wilayah', site.regency],
                  ['Provinsi', site.province],
                  ['Versi', site.version],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="font-sans text-[11px] uppercase tracking-[0.14em] text-cocoa-faint">
                      {label}
                    </dt>
                    <dd className="text-right font-sans text-xs text-cocoa">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-line pt-3 font-sans text-[11px] leading-relaxed text-cocoa-soft">
                Identitas ini ditulis di kode sumber. Ubah melalui konfigurasi aplikasi, bukan dari
                browser, agar tidak hilang saat server dimulai ulang.
              </p>
            </section>

            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg text-cocoa">
                <UserRound size={17} className="text-brick" />
                Akun Anda
              </h2>
              <dl className="mt-4 space-y-3">
                {[
                  ['Nama', admin.name],
                  ['Email', admin.email],
                  ['Peran', admin.role],
                  ['Login terakhir', admin.lastLoginAt ? formatDate(admin.lastLoginAt) : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="font-sans text-[11px] uppercase tracking-[0.14em] text-cocoa-faint">
                      {label}
                    </dt>
                    <dd className="text-right font-sans text-xs text-cocoa">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-cream/60 px-3 py-2.5">
                <KeyRound size={14} className="mt-0.5 shrink-0 text-cocoa-soft" />
                <p className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                  Perubahan kata sandi dan penghapusan akun dilakukan langsung di basis data admin
                  pada tahap MVP ini.
                </p>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg text-cocoa">
                <Server size={17} className="text-brick" />
                Kesiapan server
              </h2>
              <div className="mt-4">
                <ConfigRow
                  label="Mode basis data"
                  value={
                    runtime.database === 'memory' || runtime.database === 'mongodb-memory'
                      ? 'MongoDB in-memory (data sementara)'
                      : runtime.database === 'external'
                        ? 'MongoDB eksternal (permanen)'
                        : runtime.database || '—'
                  }
                  ok={runtime.mongodbConfigured}
                  detail={
                    runtime.mongodbConfigured
                      ? 'MONGODB_URI terdeteksi. Data tersimpan permanen.'
                      : 'MONGODB_URI kosong. Data akan hilang setiap server dimulai ulang.'
                  }
                />
                <ConfigRow
                  label="Penyimpanan media"
                  value={
                    runtime.media === 'cloudinary'
                      ? 'Cloudinary'
                      : 'Disk lokal (server/uploads)'
                  }
                  ok={runtime.cloudinaryConfigured}
                  detail={
                    runtime.cloudinaryConfigured
                      ? 'Kredensial Cloudinary terdeteksi.'
                      : 'Kredensial Cloudinary belum diisi. Unggahan disimpan di server lokal.'
                  }
                />
                <ConfigRow
                  label="Lingkungan Node"
                  value={runtime.nodeEnv || '—'}
                  ok={runtime.nodeEnv === 'production'}
                  detail={
                    runtime.nodeEnv === 'production'
                      ? 'Mode produksi aktif.'
                      : 'Mode pengembangan. Cookie auth tidak memakai flag secure.'
                  }
                />
              </div>
            </section>

            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg text-cocoa">
                <ShieldCheck size={17} className="text-brick" />
                Daftar periksa peluncuran
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  {
                    ok: runtime.mongodbConfigured,
                    text: 'Atur MONGODB_URI ke basis data permanen (Atlas/self-hosted).',
                  },
                  {
                    ok: runtime.cloudinaryConfigured,
                    text: 'Atur kredensial Cloudinary untuk penyimpanan media produksi.',
                  },
                  {
                    ok: !demoAccount,
                    text: 'Ganti akun admin demo dan gunakan kata sandi kuat.',
                  },
                  {
                    ok: runtime.nodeEnv === 'production',
                    text: 'Jalankan server dengan NODE_ENV=production dan HTTPS.',
                  },
                  {
                    ok: true,
                    text: 'Periksa label draf/terverifikasi pada seluruh konten sebelum tayang.',
                  },
                  {
                    ok: true,
                    text: 'Ganti aset contoh (logo, foto, peta) dengan dokumentasi resmi.',
                  },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2.5">
                    {item.ok ? (
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-dark" />
                    ) : (
                      <XCircle size={15} className="mt-0.5 shrink-0 text-brick" />
                    )}
                    <span className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/admin/lokasi" className="btn-outline btn-sm">
                  <Database size={14} />
                  Periksa koordinat
                </Link>
                <Link to="/admin/video" className="btn-outline btn-sm">
                  <Image size={14} />
                  Slot video
                </Link>
                <a href="/" target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                  <ExternalLink size={14} />
                  Buka situs publik
                </a>
              </div>
            </section>
          </div>

          <section className="card p-5">
            <h2 className="font-display text-lg text-cocoa">Kebijakan konten MVP</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                Konten seed ditandai <strong className="text-cocoa">Konten draf</strong> sampai
                sumber, koordinat, dan narasinya diverifikasi. Label ini tampil di halaman publik
                agar pengunjung tidak menganggapnya sebagai dokumentasi resmi.
              </p>
              <p className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                Kontribusi komunitas tidak pernah otomatis tayang. Status “disetujui” hanya berarti
                lolos triase awal; editor tetap menyalin dan memverifikasi isinya secara manual.
              </p>
              <p className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                Aset visual di folder <span className="font-mono">client/public/assets</span>{' '}
                adalah contoh yang dapat diganti tanpa mengubah kode, selama nama berkas tetap atau
                diperbarui di basis data.
              </p>
              <p className="font-sans text-[11px] leading-relaxed text-cocoa-soft">
                Koordinat contoh berasal dari layanan geokoding publik dan berstatus{' '}
                <strong className="text-cocoa">belum terverifikasi</strong>. Jangan gunakan untuk
                klaim batas wilayah atau rute resmi.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

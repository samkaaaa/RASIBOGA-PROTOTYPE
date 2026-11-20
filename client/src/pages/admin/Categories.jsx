import { Link } from 'react-router-dom';
import { ArrowRight, FolderTree, Info, UtensilsCrossed } from 'lucide-react';
import { getData } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import { Loading } from '../../components/common/Loading.jsx';
import { ErrorState } from '../../components/common/States.jsx';

export default function AdminCategories() {
  const { data, loading, error, reload } = useAsync(
    () => getData('/categories'),
    []
  );

  return (
    <>
      <AdminPageHeader
        title="Kategori"
        description="Kategori makanan adalah taksonomi tetap yang dipakai di seluruh aplikasi. Jumlah dihitung dari makanan terpublikasi."
      />

      <div className="mb-6 flex gap-3 rounded-2xl border border-teal/20 bg-teal-soft/50 p-4">
        <Info size={17} className="mt-0.5 shrink-0 text-teal-dark" />
        <p className="font-sans text-xs leading-relaxed text-cocoa-soft">
          Kategori didefinisikan pada model <code className="rounded bg-cream-soft/80 px-1">Food</code>{' '}
          sebagai enum: <strong>Makanan Berat</strong>, <strong>Jajanan Tradisional</strong>, dan{' '}
          <strong>Minuman</strong>. Untuk menambah kategori baru, ubah enum di server dan seed data —
          bukan melalui formulir bebas, agar filter dan navigasi tetap konsisten.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading label="Menghitung kategori…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data || []).map((category) => (
            <div key={category.name} className="card flex flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brick-soft text-brick">
                <FolderTree size={22} />
              </span>
              <h2 className="mt-4 font-display text-xl">{category.name}</h2>
              <p className="mt-1 font-sans text-xs text-cocoa-soft">
                {category.total} makanan terpublikasi
              </p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                <Link
                  to={`/jelajah?category=${encodeURIComponent(category.name)}`}
                  className="btn-outline btn-sm"
                >
                  Lihat katalog
                  <ArrowRight size={13} />
                </Link>
                <Link to="/admin/makanan" className="btn-ghost btn-sm border border-line">
                  <UtensilsCrossed size={13} />
                  Kelola
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

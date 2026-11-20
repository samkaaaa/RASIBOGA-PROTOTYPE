import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Eye,
  Image,
  Leaf,
  MapPin,
  MessageSquare,
  UtensilsCrossed,
} from 'lucide-react';
import { adminApi } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import { Loading } from '../../components/common/Loading.jsx';
import { ErrorState } from '../../components/common/States.jsx';
import { formatDate } from '../../utils/format.js';
import { SUBMISSION_STATUS_LABELS, SUBMISSION_TYPES } from '../../utils/constants.js';

const STATUS_STYLES = {
  pending: 'border-line bg-cream-soft text-cocoa-soft',
  approved: 'border-teal/25 bg-teal-soft text-teal-dark',
  rejected: 'border-brick/25 bg-brick-soft text-brick-dark',
};

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => adminApi.stats(), []);

  const totals = data?.totals || {};
  const cards = [
    {
      label: 'Makanan',
      value: totals.foods,
      sub: `${totals.publishedFoods || 0} terpublikasi`,
      icon: UtensilsCrossed,
      to: '/admin/makanan',
      tone: 'bg-brick-soft text-brick',
    },
    {
      label: 'Resep',
      value: totals.recipes,
      sub: `${totals.publishedRecipes || 0} terpublikasi`,
      icon: ChefHat,
      to: '/admin/resep',
      tone: 'bg-teal-soft text-teal-dark',
    },
    {
      label: 'Bahan',
      value: totals.ingredients,
      sub: 'Basis data bahan',
      icon: Leaf,
      to: '/admin/bahan',
      tone: 'bg-cream-deep text-cocoa',
    },
    {
      label: 'Lokasi',
      value: totals.locations,
      sub: 'Titik asal',
      icon: MapPin,
      to: '/admin/lokasi',
      tone: 'bg-teal-soft text-teal-dark',
    },
    {
      label: 'Artikel',
      value: totals.articles,
      sub: 'Cerita & budaya',
      icon: BookOpen,
      to: '/admin/artikel',
      tone: 'bg-brick-soft text-brick',
    },
    {
      label: 'Video',
      value: totals.videos,
      sub: 'Slot multimedia',
      icon: Image,
      to: '/admin/video',
      tone: 'bg-cream-deep text-cocoa',
    },
  ];

  const foodColumns = [
    {
      key: 'name',
      header: 'Makanan',
      render: (row) => (
        <div>
          <p className="font-sans text-sm font-semibold text-cocoa">{row.name}</p>
          <p className="font-sans text-[11px] text-cocoa-faint">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 font-sans text-[10px] font-semibold ${
            row.published
              ? 'border-teal/25 bg-teal-soft text-teal-dark'
              : 'border-line bg-cream-soft text-cocoa-soft'
          }`}
        >
          {row.published ? 'Terpublikasi' : 'Draf'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Diperbarui',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Link
          to="/admin/makanan"
          className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-brick"
        >
          Kelola
          <ArrowRight size={12} />
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Ringkasan"
        title="Selamat datang di ruang editor"
        description="Pantau status konten, kontribusi komunitas, dan kesiapan data sebelum dipublikasikan."
        action={{
          label: 'Kelola makanan',
          onClick: () => {
            window.location.href = '/admin/makanan';
          },
          icon: <ArrowRight size={14} />,
        }}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading label="Memuat ringkasan…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link key={card.label} to={card.to} className="card-sm card-hover flex items-center gap-4 p-5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${card.tone}`}>
                  <card.icon size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa-faint">
                    {card.label}
                  </p>
                  <p className="font-display text-2xl leading-tight text-cocoa">{card.value ?? '—'}</p>
                  <p className="font-sans text-[11px] text-cocoa-soft">{card.sub}</p>
                </div>
                <ArrowRight size={15} className="shrink-0 text-cocoa-faint" />
              </Link>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl">Makanan terbaru</h2>
                <Link to="/admin/makanan" className="link-underline text-xs">
                  Semua makanan
                  <ArrowRight size={13} />
                </Link>
              </div>
              <AdminTable
                columns={foodColumns}
                rows={data?.recentFoods || []}
                emptyMessage="Belum ada makanan."
              />
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-lg">
                    <MessageSquare size={17} className="text-brick" />
                    Kontribusi
                  </h2>
                  <Link
                    to="/admin/kontribusi"
                    className="font-sans text-[11px] font-semibold text-brick"
                  >
                    Tinjau
                  </Link>
                </div>
                <p className="mt-2 font-display text-3xl text-cocoa">
                  {totals.pendingSubmissions ?? 0}
                </p>
                <p className="font-sans text-[11px] text-cocoa-soft">menunggu peninjauan</p>

                <ul className="mt-4 space-y-3">
                  {(data?.recentSubmissions || []).map((item) => (
                    <li key={item._id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                      <p className="truncate font-sans text-xs font-semibold text-cocoa">
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate font-sans text-[10px] text-cocoa-faint">
                          {SUBMISSION_TYPES.find((type) => type.value === item.type)?.label ||
                            item.type}{' '}
                          · {item.name}
                        </span>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-sans text-[9px] font-semibold ${STATUS_STYLES[item.status] || ''}`}
                        >
                          {SUBMISSION_STATUS_LABELS[item.status] || item.status}
                        </span>
                      </div>
                    </li>
                  ))}
                  {!data?.recentSubmissions?.length && (
                    <li className="font-sans text-xs text-cocoa-soft">Belum ada kontribusi masuk.</li>
                  )}
                </ul>
              </div>

              <div className="card p-5">
                <h2 className="font-display text-lg">Tautan cepat</h2>
                <div className="mt-3 grid gap-2">
                  <Link to="/" className="btn-outline btn-sm justify-start">
                    <Eye size={14} />
                    Lihat situs publik
                  </Link>
                  <Link to="/admin/resep" className="btn-outline btn-sm justify-start">
                    <ChefHat size={14} />
                    Kelola resep
                  </Link>
                  <Link to="/admin/lokasi" className="btn-outline btn-sm justify-start">
                    <MapPin size={14} />
                    Periksa koordinat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

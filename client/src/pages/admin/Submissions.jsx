import { useMemo, useState } from 'react';
import { Check, Clock, Mail, MessageSquare, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getData, mediaUrl } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Field from '../../components/admin/Field.jsx';
import { formatDate } from '../../utils/format.js';
import { SUBMISSION_STATUS_LABELS, SUBMISSION_TYPES } from '../../utils/constants.js';

const STATUS_STYLES = {
  pending: 'border-line bg-cream-soft text-cocoa-soft',
  approved: 'border-teal/25 bg-teal-soft text-teal-dark',
  rejected: 'border-brick/25 bg-brick-soft text-brick-dark',
};

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

function typeLabel(value) {
  return SUBMISSION_TYPES.find((type) => type.value === value)?.label || value;
}

export default function AdminSubmissions() {
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () =>
      getData('/community/submissions', {
        params: { limit: 100, ...(status ? { status } : {}) },
      }).then((response) => response.data),
    [status]
  );

  const rows = useMemo(() => {
    const list = data || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(normalized) ||
        (item.name || '').toLowerCase().includes(normalized) ||
        (item.email || '').toLowerCase().includes(normalized)
    );
  }, [data, query]);

  const openReview = (submission) => {
    setReviewing(submission);
    setNote(submission.adminNote || '');
  };

  const closeReview = () => {
    setReviewing(null);
    setNote('');
  };

  const updateStatus = async (nextStatus) => {
    if (!reviewing) return;
    setSaving(true);
    try {
      await api.patch(`/community/submissions/${reviewing._id}/status`, {
        status: nextStatus,
        adminNote: note.trim(),
      });
      toast.success(`Kontribusi ditandai "${SUBMISSION_STATUS_LABELS[nextStatus]}".`);
      closeReview();
      reload();
    } catch (updateError) {
      toast.error(updateError.message || 'Gagal memperbarui status kontribusi.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Kontribusi',
      render: (row) => (
        <div className="min-w-0">
          <p className="line-clamp-2 font-sans text-sm font-semibold text-cocoa">{row.title}</p>
          <p className="font-sans text-[10px] text-cocoa-faint">{typeLabel(row.type)}</p>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Pengirim',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-sans text-xs font-medium text-cocoa">{row.name}</p>
          <p className="truncate font-sans text-[10px] text-cocoa-faint">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Masuk',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold ${
            STATUS_STYLES[row.status] || ''
          }`}
        >
          {SUBMISSION_STATUS_LABELS[row.status] || row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => openReview(row)}
          className="btn-outline btn-sm"
          aria-label={`Tinjau ${row.title}`}
        >
          Tinjau
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Komunitas"
        title="Kontribusi warga"
        description="Setiap kiriman masuk sebagai draf. Tinjau konteks, catat sumber, lalu putuskan sebelum dipindahkan ke basis data utama."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-full border border-line bg-cream-soft p-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold transition-colors ${
                status === filter.value
                  ? 'bg-cocoa text-cream'
                  : 'text-cocoa-soft hover:bg-cream hover:text-cocoa'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative lg:w-80">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul, nama, atau email…"
            className="admin-input h-10 pl-9"
          />
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage={
          status === 'pending'
            ? 'Tidak ada kontribusi yang menunggu peninjauan.'
            : 'Belum ada kontribusi pada filter ini.'
        }
      />

      <p className="mt-3 font-sans text-[11px] text-cocoa-faint">
        {loading ? 'Memuat…' : `${rows.length} kontribusi ditampilkan.`} Kontribusi yang disetujui
        tetap perlu disalin manual ke formulir makanan/resep/artikel agar melalui pemeriksaan konten.
      </p>

      <Modal
        open={Boolean(reviewing)}
        onClose={closeReview}
        title="Tinjau kontribusi"
        description="Status hanya menandai antrean editorial. Tidak ada konten yang otomatis tayang di situs publik."
        size="md"
        footer={
          <>
            <button type="button" onClick={closeReview} className="btn-ghost btn-sm">
              Batal
            </button>
            <button
              type="button"
              onClick={() => updateStatus('rejected')}
              disabled={saving}
              className="btn-outline btn-sm text-brick"
            >
              <X size={14} />
              Tolak
            </button>
            <button
              type="button"
              onClick={() => updateStatus('approved')}
              disabled={saving}
              className="btn-primary btn-sm"
            >
              <Check size={14} />
              {saving ? 'Menyimpan…' : 'Setujui'}
            </button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-brick">
                  {typeLabel(reviewing.type)}
                </p>
                <h3 className="mt-1 font-display text-xl leading-tight text-cocoa">
                  {reviewing.title}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 font-sans text-[10px] font-semibold ${
                  STATUS_STYLES[reviewing.status] || ''
                }`}
              >
                {SUBMISSION_STATUS_LABELS[reviewing.status] || reviewing.status}
              </span>
            </div>

            <div className="grid gap-3 rounded-2xl border border-line bg-cream/60 p-4 sm:grid-cols-2">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-faint">
                  Pengirim
                </p>
                <p className="mt-1 font-sans text-sm text-cocoa">{reviewing.name}</p>
                <a
                  href={`mailto:${reviewing.email}`}
                  className="mt-1 inline-flex items-center gap-1 font-sans text-xs text-brick hover:underline"
                >
                  <Mail size={12} />
                  {reviewing.email}
                </a>
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-faint">
                  Dikirim
                </p>
                <p className="mt-1 font-sans text-sm text-cocoa">{formatDate(reviewing.createdAt)}</p>
                <p className="mt-1 inline-flex items-center gap-1 font-sans text-xs text-cocoa-soft">
                  <Clock size={12} />
                  {reviewing.reviewedAt
                    ? `Ditinjau ${formatDate(reviewing.reviewedAt)}`
                    : 'Belum ditinjau'}
                </p>
              </div>
            </div>

            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-faint">
                Deskripsi
              </p>
              <p className="mt-2 whitespace-pre-line font-sans text-sm leading-relaxed text-cocoa-soft">
                {reviewing.description}
              </p>
            </div>

            {reviewing.media?.length > 0 && (
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-faint">
                  Lampiran
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reviewing.media.map((item, index) => (
                    <a
                      key={item.publicId || item.url || index}
                      href={mediaUrl(item.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-line"
                    >
                      <img
                        src={mediaUrl(item.url)}
                        alt={`Lampiran ${index + 1}`}
                        className="h-24 w-32 object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Field
              label="Catatan editor"
              hint="Catatan ini hanya terlihat oleh admin, bukan di situs publik."
            >
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                maxLength={2000}
                className="admin-input"
                placeholder="Mis. sumber perlu diverifikasi, foto kurang jelas, atau usulan sudah tercakup…"
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus('pending')}
                disabled={saving || reviewing.status === 'pending'}
                className="btn-ghost btn-sm"
              >
                <MessageSquare size={14} />
                Kembalikan ke antrean
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

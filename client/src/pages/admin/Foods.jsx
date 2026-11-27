import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getData, mediaUrl } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Field from '../../components/admin/Field.jsx';
import ImageField from '../../components/admin/ImageField.jsx';
import MediaTextEditor from '../../components/admin/MediaTextEditor.jsx';
import { DraftBadge, ProvenanceBadge } from '../../components/common/Badges.jsx';
import { CATEGORIES, PROVENANCE_OPTIONS } from '../../utils/constants.js';

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: CATEGORIES[0],
  provenanceType: 'local',
  originLocation: '',
  description: '',
  history: '',
  philosophy: '',
  sourcesText: '',
  mainImage: { url: '', publicId: '', resourceType: '' },
  contentStatus: 'draft',
  featured: false,
  published: false,
};

async function loadFoods() {
  const [foods, locations] = await Promise.all([
    getData('/foods', { params: { includeDrafts: true, limit: 100, sort: 'newest' } }),
    getData('/locations', { params: { limit: 100 } }),
  ]);
  return { foods: foods.data, locations: locations.data };
}

function toForm(food) {
  return {
    name: food.name || '',
    slug: food.slug || '',
    category: food.category || CATEGORIES[0],
    provenanceType: food.provenance?.type || 'local',
    originLocation: food.originLocation?._id || '',
    description: food.description || '',
    history: food.history || '',
    philosophy: food.philosophy || '',
    sourcesText: (food.sources || []).join('\n'),
    mainImage: food.mainImage || { url: '', publicId: '', resourceType: '' },
    contentStatus: food.contentStatus || 'draft',
    featured: Boolean(food.featured),
    published: Boolean(food.published),
  };
}

export default function AdminFoods() {
  const { data, loading, error, reload } = useAsync(loadFoods, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data?.foods || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        (item.slug || '').includes(normalized) ||
        (item.category || '').toLowerCase().includes(normalized)
    );
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (food) => {
    setEditing(food);
    setForm(toForm(food));
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama makanan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category,
        provenance: { type: form.provenanceType },
        originLocation: form.originLocation || null,
        description: form.description.trim(),
        history: form.history.trim(),
        philosophy: form.philosophy.trim(),
        sources: form.sourcesText
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        mainImage: form.mainImage,
        contentStatus: form.contentStatus,
        featured: form.featured,
        published: form.published,
      };

      if (editing) {
        await api.put(`/foods/${editing._id}`, payload);
        toast.success('Makanan diperbarui.');
      } else {
        await api.post('/foods', payload);
        toast.success('Makanan dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan makanan.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (food) => {
    if (!window.confirm(`Hapus "${food.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/foods/${food._id}`);
      toast.success('Makanan dihapus.');
      reload();
    } catch (deleteError) {
      if (deleteError.status === 409) {
        const cascade = window.confirm(
          `${deleteError.message}\n\nHapus makanan ini beserta resep terkait?`
        );
        if (!cascade) return;
        try {
          await api.delete(`/foods/${food._id}`, { params: { cascade: true } });
          toast.success('Makanan dan resep terkait dihapus.');
          reload();
        } catch (cascadeError) {
          toast.error(cascadeError.message || 'Gagal menghapus.');
        }
        return;
      }
      toast.error(deleteError.message || 'Gagal menghapus.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Makanan',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={mediaUrl(row.mainImage?.url) || '/assets/food-placeholder.svg'}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = '/assets/food-placeholder.svg';
            }}
          />
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-cocoa">{row.name}</p>
            <p className="font-sans text-[10px] text-cocoa-faint">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Kategori' },
    {
      key: 'provenance',
      header: 'Provenance',
      render: (row) => <ProvenanceBadge type={row.provenance?.type} />,
    },
    {
      key: 'origin',
      header: 'Asal',
      render: (row) =>
        row.originLocation ? (
          <span className="font-sans text-xs text-cocoa-soft">
            {[row.originLocation.village, row.originLocation.district].filter(Boolean).join(', ')}
          </span>
        ) : (
          <span className="font-sans text-xs text-cocoa-faint">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold ${
              row.published
                ? 'border-teal/25 bg-teal-soft text-teal-dark'
                : 'border-cocoa/15 bg-cream-soft text-cocoa-soft'
            }`}
          >
            {row.published ? 'Terpublikasi' : 'Tidak tayang'}
          </span>
          {row.contentStatus === 'draft' && <DraftBadge />}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-soft hover:bg-cream hover:text-cocoa"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(row)}
            className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-soft hover:bg-brick-soft hover:text-brick"
            aria-label={`Hapus ${row.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Makanan"
        description="Kelola entri katalog, provenance, status konten, dan keterkaitan lokasi asal."
        action={{ label: 'Tambah makanan', onClick: openCreate, icon: <Plus size={14} /> }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, slug, kategori…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.foods?.length || 0} entri`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada makanan."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Tambah makanan'}
        description="Konten draf tetap dapat disimpan tanpa dipublikasikan."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button type="submit" form="food-form" disabled={saving} className="btn-primary btn-sm">
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat makanan'}
            </button>
          </>
        }
      >
        <form id="food-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" required className="sm:col-span-2">
            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              className="admin-input"
              placeholder="Contoh: Lontong Tuyuhan"
            />
          </Field>

          <Field label="Slug" hint="Kosongkan untuk dibuat otomatis dari nama.">
            <input
              type="text"
              value={form.slug}
              onChange={(event) => update('slug', event.target.value)}
              className="admin-input"
              placeholder="lontong-tuyuhan"
            />
          </Field>

          <Field label="Kategori" required>
            <select
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              className="admin-input"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Provenance" required>
            <select
              value={form.provenanceType}
              onChange={(event) => update('provenanceType', event.target.value)}
              className="admin-input"
            >
              {PROVENANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Lokasi asal" hint="Lokasi dikelola di menu Lokasi.">
            <select
              value={form.originLocation}
              onChange={(event) => update('originLocation', event.target.value)}
              className="admin-input"
            >
              <option value="">— Tidak ditentukan —</option>
              {(data?.locations || []).map((location) => (
                <option key={location._id} value={location._id}>
                  {[location.name, location.district].filter(Boolean).join(' · ')}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Deskripsi" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              className="admin-input"
              placeholder="Ringkasan singkat hidangan…"
            />
          </Field>

          <div className="sm:col-span-2">
            <MediaTextEditor
              value={form.history}
              onChange={(value) => update('history', value)}
              rows={5}
              label="Sejarah & konteks"
              folder="foods/history"
              maxImages={2}
              buttonLabel="Sisipkan foto sejarah"
              captionLabel="Keterangan foto sejarah"
              captionPlaceholder="Keterangan foto sejarah (opsional): tempat, tanggal, sumber…"
              defaultCaption="Dokumentasi sejarah RASIBOGA"
              altPrefix="Foto sejarah"
              successMessage="Foto sejarah disisipkan ke sejarah masakan."
              placeholder={'Paragraf sejarah masakan…\n![Foto sejarah](https://… "Keterangan foto")'}
              help={
                <>
                  Format: <code>##</code> subjudul, <code>-</code> daftar, <code>**tebal**</code>.
                  Maksimal <strong>dua</strong> foto sejarah, ditulis sebagai{' '}
                  <code>![keterangan](url "caption")</code> pada baris tersendiri. Foto pertama tampil
                  di kanan atas dan foto kedua di kiri bawahnya, berdampingan dengan paragraf pembuka.
                </>
              }
            />
          </div>

          <Field label="Filosofi & penyajian" className="sm:col-span-2">
            <textarea
              value={form.philosophy}
              onChange={(event) => update('philosophy', event.target.value)}
              rows={4}
              className="admin-input"
            />
          </Field>

          <Field
            label="Sumber informasi"
            hint="Satu sumber per baris. Tautan http(s) akan ditampilkan sebagai pranala."
            className="sm:col-span-2"
          >
            <textarea
              value={form.sourcesText}
              onChange={(event) => update('sourcesText', event.target.value)}
              rows={3}
              className="admin-input"
              placeholder="Wawancara narasumber, 2026&#10;https://contoh-sumber.local/dokumen"
            />
          </Field>

          <div className="sm:col-span-2">
            <ImageField
              label="Gambar utama"
              value={form.mainImage}
              onChange={(value) => update('mainImage', value)}
              folder="foods"
            />
          </div>

          <Field label="Status konten">
            <select
              value={form.contentStatus}
              onChange={(event) => update('contentStatus', event.target.value)}
              className="admin-input"
            >
              <option value="draft">Draf — belum diverifikasi</option>
              <option value="verified">Terverifikasi</option>
            </select>
          </Field>

          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update('featured', event.target.checked)}
                className="h-4 w-4 accent-brick"
              />
              Tampilkan sebagai unggulan
            </label>
            <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update('published', event.target.checked)}
                className="h-4 w-4 accent-teal"
              />
              Publikasikan ke situs publik
            </label>
          </div>
        </form>
      </Modal>
    </>
  );
}

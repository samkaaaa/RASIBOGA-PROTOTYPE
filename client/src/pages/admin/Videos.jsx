import { useMemo, useState } from 'react';
import { Pencil, Play, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getData, mediaUrl } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Field from '../../components/admin/Field.jsx';
import ImageField from '../../components/admin/ImageField.jsx';

const VIDEO_TYPES = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'uploaded-video', label: 'Video terunggah' },
  { value: 'animation', label: 'Animasi' },
  { value: 'lottie', label: 'Lottie' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'youtube',
  category: 'Dokumentasi',
  url: '',
  thumbnail: '',
  relatedFood: '',
  featured: false,
  published: false,
};

async function loadVideos() {
  const [videos, foods] = await Promise.all([
    getData('/videos', { params: { includeDrafts: true, limit: 100 } }),
    getData('/foods', { params: { includeDrafts: true, limit: 100, sort: 'name' } }),
  ]);
  return { videos: videos.data, foods: foods.data };
}

export default function AdminVideos() {
  const { data, loading, error, reload } = useAsync(loadVideos, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data?.videos || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter((item) => item.title.toLowerCase().includes(normalized));
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (video) => {
    setEditing(video);
    setForm({
      title: video.title || '',
      description: video.description || '',
      type: video.type || 'youtube',
      category: video.category || 'Dokumentasi',
      url: video.url || '',
      thumbnail: video.thumbnail || '',
      relatedFood: video.relatedFood?._id || '',
      featured: Boolean(video.featured),
      published: Boolean(video.published),
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul video wajib diisi.');
      return;
    }
    if (form.type === 'youtube' && !form.url.trim()) {
      toast.error('Video YouTube memerlukan URL yang valid.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        category: form.category.trim() || 'Dokumentasi',
        url: form.url.trim(),
        thumbnail: form.thumbnail,
        relatedFood: form.relatedFood || null,
        featured: form.featured,
        published: form.published,
      };

      if (editing) {
        await api.put(`/videos/${editing._id}`, payload);
        toast.success('Video diperbarui.');
      } else {
        await api.post('/videos', payload);
        toast.success('Video dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan video.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (video) => {
    if (!window.confirm(`Hapus video "${video.title}"?`)) return;
    try {
      await api.delete(`/videos/${video._id}`);
      toast.success('Video dihapus.');
      reload();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Gagal menghapus video.');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Video',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={mediaUrl(row.thumbnail) || '/assets/videos/video-placeholder.svg'}
            alt=""
            className="h-12 w-20 shrink-0 rounded-lg border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = '/assets/videos/video-placeholder.svg';
            }}
          />
          <div className="min-w-0">
            <p className="line-clamp-2 font-sans text-sm font-semibold text-cocoa">{row.title}</p>
            <p className="font-sans text-[10px] text-cocoa-faint">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Jenis',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">
          {VIDEO_TYPES.find((type) => type.value === row.type)?.label || row.type}
        </span>
      ),
    },
    {
      key: 'relatedFood',
      header: 'Makanan',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">
          {row.relatedFood?.name || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold ${
            row.published
              ? 'border-teal/25 bg-teal-soft text-teal-dark'
              : 'border-line bg-cream-soft text-cocoa-soft'
          }`}
        >
          {row.published ? 'Terpublikasi' : 'Draf / tidak tayang'}
        </span>
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
            aria-label="Edit video"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(row)}
            className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-soft hover:bg-brick-soft hover:text-brick"
            aria-label="Hapus video"
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
        title="Video & multimedia"
        description="Slot video disiapkan untuk dokumentasi. Video YouTube memerlukan tautan yang valid."
        action={{ label: 'Tambah video', onClick: openCreate, icon: <Plus size={14} /> }}
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
            placeholder="Cari judul video…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.videos?.length || 0} video`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada video."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit video' : 'Tambah video'}
        description="Untuk YouTube, tempel URL biasa; server akan membuat URL embed."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="video-form"
              disabled={saving}
              className="btn-primary btn-sm"
            >
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat video'}
            </button>
          </>
        }
      >
        <form id="video-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul" required className="sm:col-span-2">
            <input
              type="text"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Deskripsi" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              className="admin-input"
            />
          </Field>

          <Field label="Jenis">
            <select
              value={form.type}
              onChange={(event) => update('type', event.target.value)}
              className="admin-input"
            >
              {VIDEO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kategori">
            <input
              type="text"
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field
            label="URL video"
            hint="YouTube: https://www.youtube.com/watch?v=…"
            className="sm:col-span-2"
          >
            <input
              type="url"
              value={form.url}
              onChange={(event) => update('url', event.target.value)}
              className="admin-input"
              placeholder="https://…"
            />
          </Field>

          <Field label="Makanan terkait">
            <select
              value={form.relatedFood}
              onChange={(event) => update('relatedFood', event.target.value)}
              className="admin-input"
            >
              <option value="">— Tidak terkait —</option>
              {(data?.foods || []).map((food) => (
                <option key={food._id} value={food._id}>
                  {food.name}
                </option>
              ))}
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
              Unggulan
            </label>
            <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update('published', event.target.checked)}
                className="h-4 w-4 accent-teal"
              />
              Publikasikan
            </label>
          </div>

          <div className="sm:col-span-2">
            <ImageField
              label="Thumbnail"
              value={form.thumbnail}
              onChange={(value) => update('thumbnail', value)}
              folder="videos"
              stringValue
            />
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-cream p-3 font-sans text-[11px] leading-relaxed text-cocoa-soft sm:col-span-2">
            <Play size={14} className="mt-0.5 shrink-0 text-brick" />
            Slot video tanpa URL akan tampil sebagai kartu "contoh slot" di situs publik, bukan
            sebagai video yang dapat diputar.
          </p>
        </form>
      </Modal>
    </>
  );
}

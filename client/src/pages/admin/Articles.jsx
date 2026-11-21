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
import ArticleContentEditor from '../../components/admin/ArticleContentEditor.jsx';
import { formatDate } from '../../utils/format.js';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Budaya',
  author: 'Tim RASIBOGA',
  coverImage: '',
  content: '',
  published: false,
};

async function loadArticles() {
  const response = await getData('/articles', { params: { includeDrafts: true, limit: 100 } });
  return response.data;
}

export default function AdminArticles() {
  const { data, loading, error, reload } = useAsync(loadArticles, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        (item.category || '').toLowerCase().includes(normalized)
    );
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (article) => {
    setEditing(article);
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      category: article.category || 'Budaya',
      author: article.author || 'Tim RASIBOGA',
      coverImage: article.coverImage || '',
      content: article.content || '',
      published: Boolean(article.published),
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul artikel wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt.trim(),
        category: form.category.trim() || 'Budaya',
        author: form.author.trim() || 'Tim RASIBOGA',
        coverImage: form.coverImage,
        content: form.content.trim(),
        published: form.published,
      };

      if (editing) {
        await api.put(`/articles/${editing._id}`, payload);
        toast.success('Artikel diperbarui.');
      } else {
        await api.post('/articles', payload);
        toast.success('Artikel dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan artikel.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (article) => {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;
    try {
      await api.delete(`/articles/${article._id}`);
      toast.success('Artikel dihapus.');
      reload();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Gagal menghapus artikel.');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Artikel',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={mediaUrl(row.coverImage) || '/assets/articles/article-1.svg'}
            alt=""
            className="h-11 w-16 shrink-0 rounded-lg border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = '/assets/articles/article-1.svg';
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
      key: 'author',
      header: 'Penulis',
      render: (row) => <span className="font-sans text-xs text-cocoa-soft">{row.author}</span>,
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">{formatDate(row.createdAt)}</span>
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
          {row.published ? 'Terpublikasi' : 'Draf'}
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
            aria-label={`Edit ${row.title}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(row)}
            className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-soft hover:bg-brick-soft hover:text-brick"
            aria-label={`Hapus ${row.title}`}
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
        title="Artikel & cerita"
        description="Tulis catatan budaya, metodologi, atau pengantar peta. Sisipkan foto arsip dari kolom ISI ARTIKEL; format teks mendukung ## subjudul, daftar, **tebal**, dan ![keterangan](url)."
        action={{ label: 'Tambah artikel', onClick: openCreate, icon: <Plus size={14} /> }}
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
            placeholder="Cari judul atau kategori…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.length || 0} artikel`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada artikel."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit artikel' : 'Tambah artikel'}
        description="Slug kosong akan dibuat otomatis dari judul."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="article-form"
              disabled={saving}
              className="btn-primary btn-sm"
            >
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat artikel'}
            </button>
          </>
        }
      >
        <form id="article-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul" required className="sm:col-span-2">
            <input
              type="text"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Slug">
            <input
              type="text"
              value={form.slug}
              onChange={(event) => update('slug', event.target.value)}
              className="admin-input"
              placeholder="judul-artikel"
            />
          </Field>

          <Field label="Kategori">
            <input
              type="text"
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              className="admin-input"
              list="article-categories"
            />
            <datalist id="article-categories">
              <option value="Budaya" />
              <option value="Metodologi" />
              <option value="Peta" />
            </datalist>
          </Field>

          <Field label="Penulis">
            <input
              type="text"
              value={form.author}
              onChange={(event) => update('author', event.target.value)}
              className="admin-input"
            />
          </Field>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update('published', event.target.checked)}
                className="h-4 w-4 accent-teal"
              />
              Publikasikan artikel
            </label>
          </div>

          <Field label="Ringkasan" className="sm:col-span-2">
            <textarea
              value={form.excerpt}
              onChange={(event) => update('excerpt', event.target.value)}
              rows={2}
              className="admin-input"
              maxLength={500}
            />
          </Field>

          <div className="sm:col-span-2">
            <ImageField
              label="Gambar sampul"
              value={form.coverImage}
              onChange={(value) => update('coverImage', value)}
              folder="articles"
              stringValue
            />
          </div>

          <div className="sm:col-span-2">
            <ArticleContentEditor
              value={form.content}
              onChange={(value) => update('content', value)}
              rows={12}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

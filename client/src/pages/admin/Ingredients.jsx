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
import { VerificationBadge } from '../../components/common/Badges.jsx';

const EMPTY_FORM = {
  name: '',
  description: '',
  verificationStatus: 'unverified',
  originLocations: [],
  image: { url: '', publicId: '', resourceType: '' },
};

async function loadIngredients() {
  const [ingredients, locations] = await Promise.all([
    getData('/ingredients', { params: { limit: 100 } }),
    getData('/locations', { params: { limit: 100 } }),
  ]);
  return { ingredients: ingredients.data, locations: locations.data };
}

export default function AdminIngredients() {
  const { data, loading, error, reload } = useAsync(loadIngredients, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data?.ingredients || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleOrigin = (id) => {
    setForm((current) => ({
      ...current,
      originLocations: current.originLocations.includes(id)
        ? current.originLocations.filter((item) => item !== id)
        : [...current.originLocations, id],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (ingredient) => {
    setEditing(ingredient);
    setForm({
      name: ingredient.name || '',
      description: ingredient.description || '',
      verificationStatus: ingredient.verificationStatus || 'unverified',
      originLocations: (ingredient.originLocations || []).map((item) => item._id),
      image: ingredient.image || { url: '', publicId: '', resourceType: '' },
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama bahan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        verificationStatus: form.verificationStatus,
        originLocations: form.originLocations,
        image: form.image,
      };

      if (editing) {
        await api.put(`/ingredients/${editing._id}`, payload);
        toast.success('Bahan diperbarui.');
      } else {
        await api.post('/ingredients', payload);
        toast.success('Bahan dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan bahan.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ingredient) => {
    if (!window.confirm(`Hapus bahan "${ingredient.name}"? Bahan akan dilepas dari resep terkait.`)) {
      return;
    }
    try {
      await api.delete(`/ingredients/${ingredient._id}`);
      toast.success('Bahan dihapus.');
      reload();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Gagal menghapus bahan.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Bahan',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={mediaUrl(row.image?.url) || '/assets/ingredients/placeholder.svg'}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = '/assets/ingredients/placeholder.svg';
            }}
          />
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-cocoa">{row.name}</p>
            <p className="line-clamp-1 font-sans text-[10px] text-cocoa-faint">
              {row.description || 'Tanpa deskripsi'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'origins',
      header: 'Asal',
      render: (row) =>
        row.originLocations?.length ? (
          <span className="font-sans text-xs text-cocoa-soft">
            {row.originLocations
              .map((item) => item.district || item.name)
              .filter(Boolean)
              .join(', ')}
          </span>
        ) : (
          <span className="font-sans text-xs text-cocoa-faint">Belum tercatat</span>
        ),
    },
    {
      key: 'verification',
      header: 'Verifikasi',
      render: (row) => <VerificationBadge status={row.verificationStatus} />,
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
        title="Bahan pangan"
        description="Catat bahan, asal-usul, gambar, dan status verifikasinya. Bahan terhubung ke resep."
        action={{ label: 'Tambah bahan', onClick: openCreate, icon: <Plus size={14} /> }}
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
            placeholder="Cari bahan…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.ingredients?.length || 0} bahan`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada bahan."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Tambah bahan'}
        description="Nama bahan bersifat unik di basis data."
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="ingredient-form"
              disabled={saving}
              className="btn-primary btn-sm"
            >
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat bahan'}
            </button>
          </>
        }
      >
        <form id="ingredient-form" onSubmit={save} className="space-y-4">
          <Field label="Nama bahan" required>
            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              className="admin-input"
              placeholder="Contoh: Santan"
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              rows={3}
              className="admin-input"
              placeholder="Keterangan singkat bahan…"
            />
          </Field>

          <Field label="Status verifikasi">
            <select
              value={form.verificationStatus}
              onChange={(event) => update('verificationStatus', event.target.value)}
              className="admin-input"
            >
              <option value="unverified">Belum terverifikasi</option>
              <option value="verified">Terverifikasi</option>
            </select>
          </Field>

          <div>
            <span className="admin-label">Lokasi asal</span>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-line bg-cream-soft/70 p-2">
              {(data?.locations || []).map((location) => (
                <label
                  key={location._id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-sans text-xs hover:bg-cream"
                >
                  <input
                    type="checkbox"
                    checked={form.originLocations.includes(location._id)}
                    onChange={() => toggleOrigin(location._id)}
                    className="h-4 w-4 accent-teal"
                  />
                  <span className="flex-1">
                    {location.name}
                    {location.district ? ` · ${location.district}` : ''}
                  </span>
                </label>
              ))}
              {!data?.locations?.length && (
                <p className="px-2 py-2 font-sans text-xs text-cocoa-faint">
                  Belum ada lokasi. Tambahkan melalui menu Lokasi.
                </p>
              )}
            </div>
          </div>

          <ImageField
            label="Gambar bahan"
            value={form.image}
            onChange={(value) => update('image', value)}
            folder="ingredients"
          />
        </form>
      </Modal>
    </>
  );
}

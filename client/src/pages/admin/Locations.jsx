import { useMemo, useState } from 'react';
import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getData } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Field from '../../components/admin/Field.jsx';
import { VerificationBadge } from '../../components/common/Badges.jsx';

const EMPTY_FORM = {
  name: '',
  village: '',
  district: '',
  regency: 'Rembang',
  province: 'Jawa Tengah',
  lat: '',
  lng: '',
  description: '',
  locationType: ['food-origin'],
  verificationStatus: 'unverified',
};

async function loadLocations() {
  const response = await getData('/locations', { params: { limit: 100 } });
  return response.data;
}

export default function AdminLocations() {
  const { data, loading, error, reload } = useAsync(loadLocations, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter((item) =>
      [item.name, item.village, item.district]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleType = (type) => {
    setForm((current) => ({
      ...current,
      locationType: current.locationType.includes(type)
        ? current.locationType.filter((item) => item !== type)
        : [...current.locationType, type],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (location) => {
    setEditing(location);
    setForm({
      name: location.name || '',
      village: location.village || '',
      district: location.district || '',
      regency: location.regency || 'Rembang',
      province: location.province || 'Jawa Tengah',
      lat: location.coordinates?.lat ?? '',
      lng: location.coordinates?.lng ?? '',
      description: location.description || '',
      locationType: location.locationType?.length ? location.locationType : ['food-origin'],
      verificationStatus: location.verificationStatus || 'unverified',
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama lokasi wajib diisi.');
      return;
    }
    if (!form.locationType.length) {
      toast.error('Pilih minimal satu jenis lokasi.');
      return;
    }

    const lat = form.lat === '' ? null : Number(form.lat);
    const lng = form.lng === '' ? null : Number(form.lng);
    if ((lat === null) !== (lng === null)) {
      toast.error('Isi lintang dan bujur sekaligus, atau kosongkan keduanya.');
      return;
    }
    if (lat !== null && (Number.isNaN(lat) || Number.isNaN(lng))) {
      toast.error('Koordinat harus berupa angka.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        regency: form.regency.trim(),
        province: form.province.trim(),
        coordinates: { lat, lng },
        description: form.description.trim(),
        locationType: form.locationType,
        verificationStatus: form.verificationStatus,
      };

      if (editing) {
        await api.put(`/locations/${editing._id}`, payload);
        toast.success('Lokasi diperbarui.');
      } else {
        await api.post('/locations', payload);
        toast.success('Lokasi dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan lokasi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (location) => {
    if (!window.confirm(`Hapus lokasi "${location.name}"?`)) return;
    try {
      await api.delete(`/locations/${location._id}`);
      toast.success('Lokasi dihapus.');
      reload();
    } catch (deleteError) {
      if (deleteError.status === 409) {
        const cascade = window.confirm(`${deleteError.message}\n\nLepas keterkaitan dan hapus?`);
        if (!cascade) return;
        try {
          await api.delete(`/locations/${location._id}`, { params: { cascade: true } });
          toast.success('Lokasi dihapus dan keterkaitan dilepas.');
          reload();
        } catch (cascadeError) {
          toast.error(cascadeError.message || 'Gagal menghapus lokasi.');
        }
        return;
      }
      toast.error(deleteError.message || 'Gagal menghapus lokasi.');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Lokasi',
      render: (row) => (
        <div className="flex items-center gap-2">
          <MapPin size={15} className="shrink-0 text-brick" />
          <div>
            <p className="font-sans text-sm font-semibold text-cocoa">{row.name}</p>
            <p className="font-sans text-[10px] text-cocoa-faint">
              {[row.village, row.district].filter(Boolean).join(', ') || 'Detail belum lengkap'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'coordinates',
      header: 'Koordinat',
      render: (row) =>
        row.hasCoordinates ? (
          <span className="font-sans text-xs text-cocoa-soft">
            {Number(row.coordinates.lat).toFixed(4)}, {Number(row.coordinates.lng).toFixed(4)}
          </span>
        ) : (
          <span className="font-sans text-xs text-cocoa-faint">Belum tersedia</span>
        ),
    },
    {
      key: 'type',
      header: 'Jenis',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">
          {(row.locationType || [])
            .map((type) => (type === 'food-origin' ? 'Makanan' : 'Bahan'))
            .join(' · ') || '—'}
        </span>
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
        title="Lokasi & koordinat"
        description="Koordinat hanya ditampilkan di peta bila berisi angka yang valid. Tandai terverifikasi setelah dicek di lapangan."
        action={{ label: 'Tambah lokasi', onClick: openCreate, icon: <Plus size={14} /> }}
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
            placeholder="Cari lokasi, desa, kecamatan…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.length || 0} lokasi`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada lokasi."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Tambah lokasi'}
        description="Kosongkan koordinat bila titik belum dapat diverifikasi."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="location-form"
              disabled={saving}
              className="btn-primary btn-sm"
            >
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat lokasi'}
            </button>
          </>
        }
      >
        <form id="location-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama lokasi" required className="sm:col-span-2">
            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              className="admin-input"
              placeholder="Contoh: Desa Tuyuhan"
            />
          </Field>

          <Field label="Desa / kelurahan">
            <input
              type="text"
              value={form.village}
              onChange={(event) => update('village', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Kecamatan">
            <input
              type="text"
              value={form.district}
              onChange={(event) => update('district', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Kabupaten">
            <input
              type="text"
              value={form.regency}
              onChange={(event) => update('regency', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Provinsi">
            <input
              type="text"
              value={form.province}
              onChange={(event) => update('province', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Lintang (lat)" hint="Contoh: -6.7215">
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(event) => update('lat', event.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Bujur (lng)" hint="Contoh: 111.4684">
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(event) => update('lng', event.target.value)}
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

          <div>
            <span className="admin-label">Jenis lokasi</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
                <input
                  type="checkbox"
                  checked={form.locationType.includes('food-origin')}
                  onChange={() => toggleType('food-origin')}
                  className="h-4 w-4 accent-brick"
                />
                Asal makanan
              </label>
              <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
                <input
                  type="checkbox"
                  checked={form.locationType.includes('ingredient-origin')}
                  onChange={() => toggleType('ingredient-origin')}
                  className="h-4 w-4 accent-teal"
                />
                Asal bahan
              </label>
            </div>
          </div>

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
        </form>
      </Modal>
    </>
  );
}

import { useMemo, useState } from 'react';
import { ChefHat, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getData, mediaUrl } from '../../services/api.js';
import useAsync from '../../hooks/useAsync.js';
import AdminPageHeader from '../../components/admin/PageHeader.jsx';
import AdminTable from '../../components/admin/AdminTable.jsx';
import Modal from '../../components/admin/Modal.jsx';
import Field from '../../components/admin/Field.jsx';
import { DraftBadge } from '../../components/common/Badges.jsx';
import { DIFFICULTIES } from '../../utils/constants.js';
import { formatMinutes, totalTime } from '../../utils/format.js';

const newIngredientRow = () => ({ ingredient: '', name: '', quantity: '', unit: '', notes: '' });
const newStepRow = () => ({ title: '', description: '', durationSeconds: '', tips: '' });

const EMPTY_FORM = {
  food: '',
  title: '',
  servings: '2',
  preparationTime: '0',
  cookingTime: '0',
  difficulty: 'Mudah',
  contentStatus: 'draft',
  published: false,
  notes: '',
  equipmentText: '',
  ingredients: [newIngredientRow()],
  steps: [newStepRow()],
};

async function loadRecipes() {
  const [recipes, foods, ingredients] = await Promise.all([
    getData('/recipes', { params: { includeDrafts: true, limit: 100 } }),
    getData('/foods', { params: { includeDrafts: true, limit: 100, sort: 'name' } }),
    getData('/ingredients', { params: { limit: 100 } }),
  ]);
  return { recipes: recipes.data, foods: foods.data, ingredients: ingredients.data };
}

function toForm(recipe) {
  return {
    food: recipe.food?._id || '',
    title: recipe.title || '',
    servings: String(recipe.servings ?? 2),
    preparationTime: String(recipe.preparationTime ?? 0),
    cookingTime: String(recipe.cookingTime ?? 0),
    difficulty: recipe.difficulty || 'Mudah',
    contentStatus: recipe.contentStatus || 'draft',
    published: Boolean(recipe.published),
    notes: recipe.notes || '',
    equipmentText: (recipe.equipment || []).join(', '),
    ingredients: recipe.ingredients?.length
      ? recipe.ingredients.map((item) => ({
          ingredient: item.ingredient?._id || '',
          name: item.name || '',
          quantity: item.quantity === null || item.quantity === undefined ? '' : String(item.quantity),
          unit: item.unit || '',
          notes: item.notes || '',
        }))
      : [newIngredientRow()],
    steps: recipe.steps?.length
      ? recipe.steps.map((step) => ({
          title: step.title || '',
          description: step.description || '',
          durationSeconds: String(step.durationSeconds ?? ''),
          tips: step.tips || '',
        }))
      : [newStepRow()],
  };
}

export default function AdminRecipes() {
  const { data, loading, error, reload } = useAsync(loadRecipes, []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const list = data?.recipes || [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(normalized) ||
        (item.food?.name || '').toLowerCase().includes(normalized)
    );
  }, [data, query]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateRow = (field, index, key, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addRow = (field, factory) => {
    setForm((current) => ({ ...current, [field]: [...current[field], factory()] }));
  };

  const removeRow = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]:
        current[field].length > 1
          ? current[field].filter((_, rowIndex) => rowIndex !== index)
          : [field === 'ingredients' ? newIngredientRow() : newStepRow()],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (recipe) => {
    setEditing(recipe);
    setForm(toForm(recipe));
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();

    if (!form.food) {
      toast.error('Pilih makanan untuk resep ini.');
      return;
    }
    const validSteps = form.steps.filter((step) => step.description.trim());
    if (!validSteps.length) {
      toast.error('Minimal satu langkah memasak wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        food: form.food,
        title: form.title.trim(),
        servings: Number(form.servings) || 1,
        preparationTime: Number(form.preparationTime) || 0,
        cookingTime: Number(form.cookingTime) || 0,
        difficulty: form.difficulty,
        contentStatus: form.contentStatus,
        published: form.published,
        notes: form.notes.trim(),
        equipment: form.equipmentText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        ingredients: form.ingredients
          .filter((item) => item.ingredient || item.name.trim())
          .map((item) => ({
            ingredient: item.ingredient || null,
            name: item.name.trim(),
            quantity: item.quantity === '' ? null : Number(item.quantity),
            unit: item.unit.trim(),
            notes: item.notes.trim(),
          })),
        steps: validSteps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title.trim(),
          description: step.description.trim(),
          durationSeconds: Number(step.durationSeconds) || 0,
          tips: step.tips.trim(),
        })),
      };

      if (editing) {
        await api.put(`/recipes/${editing._id}`, payload);
        toast.success('Resep diperbarui.');
      } else {
        await api.post('/recipes', payload);
        toast.success('Resep dibuat.');
      }
      setOpen(false);
      reload();
    } catch (saveError) {
      toast.error(saveError.message || 'Gagal menyimpan resep.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (recipe) => {
    const label = recipe.title || recipe.food?.name || 'resep ini';
    if (!window.confirm(`Hapus "${label}"?`)) return;
    try {
      await api.delete(`/recipes/${recipe._id}`);
      toast.success('Resep dihapus.');
      reload();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Gagal menghapus resep.');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Resep',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={mediaUrl(row.food?.mainImage?.url) || '/assets/food-placeholder.svg'}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = '/assets/food-placeholder.svg';
            }}
          />
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-cocoa">
              {row.title || `Resep ${row.food?.name || ''}`}
            </p>
            <p className="font-sans text-[10px] text-cocoa-faint">{row.food?.name || 'Tanpa makanan'}</p>
          </div>
        </div>
      ),
    },
    { key: 'difficulty', header: 'Tingkat' },
    {
      key: 'time',
      header: 'Total waktu',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">{formatMinutes(totalTime(row))}</span>
      ),
    },
    {
      key: 'steps',
      header: 'Langkah',
      render: (row) => (
        <span className="font-sans text-xs text-cocoa-soft">{row.steps?.length || 0}</span>
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
            aria-label="Edit resep"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(row)}
            className="grid h-8 w-8 place-items-center rounded-lg text-cocoa-soft hover:bg-brick-soft hover:text-brick"
            aria-label="Hapus resep"
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
        title="Resep"
        description="Susun bahan, langkah, waktu, dan status verifikasi. Resep draf tetap dapat disimpan."
        action={{ label: 'Tambah resep', onClick: openCreate, icon: <Plus size={14} /> }}
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
            placeholder="Cari judul resep atau makanan…"
            className="admin-input h-10 pl-9"
          />
        </div>
        <p className="font-sans text-xs text-cocoa-faint">
          {loading ? 'Memuat…' : `${rows.length} dari ${data?.recipes?.length || 0} resep`}
        </p>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="Belum ada resep."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit resep' : 'Tambah resep'}
        description="Langkah kosong akan diabaikan. Nomor langkah dihitung otomatis oleh server."
        size="xl"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">
              Batal
            </button>
            <button type="submit" form="recipe-form" disabled={saving} className="btn-primary btn-sm">
              {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Buat resep'}
            </button>
          </>
        }
      >
        <form id="recipe-form" onSubmit={save} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Makanan" required className="sm:col-span-2">
              <select
                value={form.food}
                onChange={(event) => update('food', event.target.value)}
                className="admin-input"
              >
                <option value="">— Pilih makanan —</option>
                {(data?.foods || []).map((food) => (
                  <option key={food._id} value={food._id}>
                    {food.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Judul resep" hint="Kosongkan untuk 'Resep [nama makanan]'.">
              <input
                type="text"
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                className="admin-input"
              />
            </Field>

            <Field label="Porsi">
              <input
                type="number"
                min="1"
                max="100"
                value={form.servings}
                onChange={(event) => update('servings', event.target.value)}
                className="admin-input"
              />
            </Field>

            <Field label="Persiapan (menit)">
              <input
                type="number"
                min="0"
                value={form.preparationTime}
                onChange={(event) => update('preparationTime', event.target.value)}
                className="admin-input"
              />
            </Field>

            <Field label="Memasak (menit)">
              <input
                type="number"
                min="0"
                value={form.cookingTime}
                onChange={(event) => update('cookingTime', event.target.value)}
                className="admin-input"
              />
            </Field>

            <Field label="Tingkat kesulitan">
              <select
                value={form.difficulty}
                onChange={(event) => update('difficulty', event.target.value)}
                className="admin-input"
              >
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

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

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 font-sans text-xs text-cocoa">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => update('published', event.target.checked)}
                  className="h-4 w-4 accent-teal"
                />
                Publikasikan resep
              </label>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg">Bahan</h3>
              <button
                type="button"
                onClick={() => addRow('ingredients', newIngredientRow)}
                className="btn-outline btn-sm"
              >
                <Plus size={13} />
                Tambah bahan
              </button>
            </div>

            <div className="space-y-3">
              {form.ingredients.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-line bg-cream-soft/70 p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_0.6fr_0.6fr_auto]">
                    <select
                      value={row.ingredient}
                      onChange={(event) => updateRow('ingredients', index, 'ingredient', event.target.value)}
                      className="admin-input"
                      aria-label="Bahan terhubung"
                    >
                      <option value="">— Tidak terhubung —</option>
                      {(data?.ingredients || []).map((ingredient) => (
                        <option key={ingredient._id} value={ingredient._id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateRow('ingredients', index, 'name', event.target.value)}
                      placeholder="Nama tampilan"
                      className="admin-input"
                      aria-label="Nama bahan"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.quantity}
                      onChange={(event) => updateRow('ingredients', index, 'quantity', event.target.value)}
                      placeholder="Jumlah"
                      className="admin-input"
                      aria-label="Jumlah"
                    />
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(event) => updateRow('ingredients', index, 'unit', event.target.value)}
                      placeholder="Satuan"
                      className="admin-input"
                      aria-label="Satuan"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow('ingredients', index)}
                      className="grid h-9 w-9 place-items-center self-center rounded-lg text-cocoa-faint hover:bg-brick-soft hover:text-brick"
                      aria-label="Hapus baris bahan"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(event) => updateRow('ingredients', index, 'notes', event.target.value)}
                    placeholder="Catatan bahan (opsional)"
                    className="admin-input mt-2"
                    aria-label="Catatan bahan"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg">Langkah memasak</h3>
              <button
                type="button"
                onClick={() => addRow('steps', newStepRow)}
                className="btn-outline btn-sm"
              >
                <Plus size={13} />
                Tambah langkah
              </button>
            </div>

            <div className="space-y-3">
              {form.steps.map((step, index) => (
                <div key={index} className="rounded-xl border border-line bg-cream-soft/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-cocoa-soft">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brick font-sans text-[10px] text-cream-soft">
                        {index + 1}
                      </span>
                      Langkah
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow('steps', index)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-cocoa-faint hover:bg-brick-soft hover:text-brick"
                      aria-label="Hapus langkah"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1.4fr_0.6fr]">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(event) => updateRow('steps', index, 'title', event.target.value)}
                      placeholder="Judul langkah"
                      className="admin-input"
                      aria-label="Judul langkah"
                    />
                    <input
                      type="number"
                      min="0"
                      value={step.durationSeconds}
                      onChange={(event) =>
                        updateRow('steps', index, 'durationSeconds', event.target.value)
                      }
                      placeholder="Durasi (detik)"
                      className="admin-input"
                      aria-label="Durasi langkah dalam detik"
                    />
                  </div>
                  <textarea
                    value={step.description}
                    onChange={(event) => updateRow('steps', index, 'description', event.target.value)}
                    rows={3}
                    placeholder="Instruksi langkah…"
                    className="admin-input mt-2"
                    aria-label="Instruksi langkah"
                  />
                  <input
                    type="text"
                    value={step.tips}
                    onChange={(event) => updateRow('steps', index, 'tips', event.target.value)}
                    placeholder="Tips (opsional)"
                    className="admin-input mt-2"
                    aria-label="Tips langkah"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peralatan" hint="Pisahkan dengan koma.">
              <textarea
                value={form.equipmentText}
                onChange={(event) => update('equipmentText', event.target.value)}
                rows={3}
                className="admin-input"
                placeholder="Panci, Wajan, Ulekan"
              />
            </Field>

            <Field label="Catatan resep">
              <textarea
                value={form.notes}
                onChange={(event) => update('notes', event.target.value)}
                rows={3}
                className="admin-input"
                placeholder="Catatan verifikasi, sumber, atau peringatan draf…"
              />
            </Field>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-cream p-3 font-sans text-[11px] leading-relaxed text-cocoa-soft">
            <ChefHat size={14} className="mt-0.5 shrink-0 text-brick" />
            Resep yang dipublikasikan akan tampil di halaman makanan dan dapat dibuka dalam mode
            memasak. Pastikan status konten sesuai dengan tingkat verifikasinya.
          </p>
        </form>
      </Modal>
    </>
  );
}

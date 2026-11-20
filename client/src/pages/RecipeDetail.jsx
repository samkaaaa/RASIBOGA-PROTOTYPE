import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Check,
  Clock,
  Flame,
  Info,
  ListChecks,
  PlayCircle,
  ScrollText,
  Timer,
  Users,
  Utensils,
} from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { DraftBadge, ProvenanceBadge } from '../components/common/Badges.jsx';
import { formatMinutes, formatSeconds, totalTime } from '../utils/format.js';

export default function RecipeDetail() {
  const { id } = useParams();
  const { data: recipe, loading, error, reload } = useAsync(
    () => getData(`/recipes/${encodeURIComponent(id)}`).then((response) => response.data),
    [id]
  );
  const [checked, setChecked] = useState({});

  if (loading && !recipe) {
    return (
      <div className="container-page py-24">
        <Loading label="Memuat resep…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-20">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/jelajah" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  const food = recipe.food;
  const isDraft = recipe.contentStatus === 'draft';
  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const tutorial = recipe.tutorialVideo;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const toggleIngredient = (index) => {
    setChecked((current) => ({ ...current, [index]: !current[index] }));
  };

  return (
    <>
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.16em] text-cocoa-faint">
          <Link to="/jelajah" className="hover:text-brick">
            Jelajah
          </Link>
          <span>/</span>
          {food?.slug && (
            <>
              <Link to={`/makanan/${food.slug}`} className="hover:text-brick">
                {food.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-cocoa-soft">Resep</span>
        </nav>
      </div>

      <section className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {food?.provenance?.type && <ProvenanceBadge type={food.provenance.type} />}
              {isDraft && <DraftBadge />}
              <span className="chip">{recipe.difficulty}</span>
            </div>

            <h1 className="display-1 mt-5">{recipe.title || `Resep ${food?.name || ''}`}</h1>

            {food && (
              <Link
                to={`/makanan/${food.slug}`}
                className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-line bg-cream/50 p-2 pr-4 transition-colors hover:border-brick/30"
              >
                <img
                  src={mediaUrl(food.mainImage?.url) || '/assets/food-placeholder.svg'}
                  alt={food.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <span>
                  <span className="block font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa-faint">
                    Hidangan
                  </span>
                  <span className="font-display text-base">{food.name}</span>
                </span>
                <ArrowRight size={15} className="ml-2 text-cocoa-faint" />
              </Link>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 sm:grid-cols-4">
              {[
                { icon: Users, label: 'Porsi', value: `${recipe.servings || '—'}` },
                { icon: Timer, label: 'Persiapan', value: formatMinutes(recipe.preparationTime) },
                { icon: Flame, label: 'Memasak', value: formatMinutes(recipe.cookingTime) },
                { icon: Clock, label: 'Total', value: formatMinutes(totalTime(recipe)) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa-faint">
                    <item.icon size={12} className="text-teal" />
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 font-display text-lg text-cocoa">{item.value}</dd>
                </div>
              ))}
            </dl>

            {isDraft && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-brick/20 bg-brick-soft/60 p-4">
                <Info size={17} className="mt-0.5 shrink-0 text-brick" />
                <p className="font-sans text-xs leading-relaxed text-cocoa">
                  Resep ini berstatus <strong>draf</strong>. Proporsi bahan, waktu, dan langkah
                  masih berupa kerangka awal. Gunakan sebagai panduan eksplorasi, bukan resep
                  keluarga yang telah diverifikasi.
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/resep/${recipe._id}/memasak`} className="btn-primary">
                <ChefHat size={16} />
                Mulai mode memasak
              </Link>
              {food?.slug && (
                <Link to={`/makanan/${food.slug}`} className="btn-outline">
                  <ArrowLeft size={15} />
                  Kembali ke hidangan
                </Link>
              )}
            </div>
          </div>

          <aside className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Daftar bahan</h2>
              <span className="font-sans text-[11px] text-cocoa-faint">
                {checkedCount}/{ingredients.length} siap
              </span>
            </div>

            {ingredients.length ? (
              <ul className="mt-4 space-y-1">
                {ingredients.map((item, index) => {
                  const label = item.ingredient?.name || item.name || 'Bahan';
                  const isChecked = Boolean(checked[index]);
                  return (
                    <li key={`${label}-${index}`}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-cocoa/5">
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                            isChecked
                              ? 'border-teal-dark bg-teal-dark text-cream-soft'
                              : 'border-cocoa/20 bg-cream-soft text-transparent'
                          }`}
                        >
                          <Check size={12} />
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleIngredient(index)}
                          className="sr-only"
                        />
                        <span className="flex-1">
                          <span
                            className={`font-sans text-sm ${
                              isChecked ? 'text-cocoa-faint line-through' : 'text-cocoa'
                            }`}
                          >
                            {item.quantity ? `${item.quantity} ` : ''}
                            {item.unit ? `${item.unit} ` : ''}
                            {label}
                          </span>
                          {item.notes && (
                            <span className="block font-sans text-[11px] text-cocoa-faint">
                              {item.notes}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 font-sans text-xs leading-relaxed text-cocoa-soft">
                Daftar bahan belum dicatat untuk resep ini.
              </p>
            )}

            {recipe.equipment?.length > 0 && (
              <>
                <h3 className="mt-6 border-t border-line pt-5 font-display text-lg">Peralatan</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {recipe.equipment.map((tool) => (
                    <li key={tool} className="chip">
                      <Utensils size={12} className="text-teal" />
                      {tool}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="section border-t border-line bg-cream/40">
        <div className="container-page grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brick-soft text-brick">
                <ListChecks size={20} />
              </span>
              <div>
                <p className="eyebrow">Langkah demi langkah</p>
                <h2 className="mt-1 font-display text-2xl">Cara membuat</h2>
              </div>
            </div>

            {steps.length ? (
              <ol className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <li key={step.stepNumber || index} className="card flex gap-4 p-5 sm:p-6">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brick font-display text-lg text-cream-soft">
                      {step.stepNumber || index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-lg">
                          {step.title || `Langkah ${index + 1}`}
                        </h3>
                        {step.durationSeconds > 0 && (
                          <span className="inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-wider text-cocoa-faint">
                            <Timer size={12} />
                            {formatSeconds(step.durationSeconds)}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-cocoa-soft">
                        {step.description}
                      </p>
                      {step.tips && (
                        <p className="mt-3 rounded-xl bg-teal-soft/70 px-3 py-2 font-sans text-xs leading-relaxed text-teal-dark">
                          <strong>Tips:</strong> {step.tips}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-cocoa/15 bg-cream-soft p-6 text-sm text-cocoa-soft">
                Langkah memasak belum dicatat.
              </p>
            )}
          </div>

          <aside className="space-y-6">
            {recipe.notes && (
              <div className="card p-6">
                <h3 className="flex items-center gap-2 font-display text-xl">
                  <ScrollText size={18} className="text-brick" />
                  Catatan resep
                </h3>
                <p className="mt-3 whitespace-pre-line font-sans text-xs leading-relaxed text-cocoa-soft">
                  {recipe.notes}
                </p>
              </div>
            )}

            <div className="card p-6">
              <h3 className="font-display text-xl">Video tutorial</h3>
              {tutorial?.embedUrl || tutorial?.url ? (
                <div className="mt-4 overflow-hidden rounded-2xl bg-black">
                  {tutorial.embedUrl ? (
                    <iframe
                      src={tutorial.embedUrl}
                      title={`Video tutorial ${recipe.title || ''}`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={mediaUrl(tutorial.url)} controls className="aspect-video w-full" />
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-cocoa/15 p-5 text-center">
                  <PlayCircle size={26} className="mx-auto text-cocoa-faint" />
                  <p className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                    Belum ada video tutorial. Slot disiapkan agar dokumentasi dapat ditambahkan
                    tanpa mengubah struktur halaman.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-cocoa p-6 text-cream-soft">
              <h3 className="font-display text-xl">Mode memasak</h3>
              <p className="mt-2 font-sans text-xs leading-relaxed text-cream/70">
                Tampilan langkah besar dengan pengatur waktu per langkah. Cocok untuk diletakkan di
                samping dapur.
              </p>
              <Link
                to={`/resep/${recipe._id}/memasak`}
                className="btn bg-cream-soft text-brick hover:bg-cream mt-4 w-full"
              >
                <ChefHat size={15} />
                Buka mode memasak
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

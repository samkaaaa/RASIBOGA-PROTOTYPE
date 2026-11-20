import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  X,
} from 'lucide-react';
import { getData, mediaUrl } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import { Loading } from '../components/common/Loading.jsx';
import { ErrorState } from '../components/common/States.jsx';
import { formatSeconds } from '../utils/format.js';

export default function CookingMode() {
  const { id } = useParams();
  const { data: recipe, loading, error, reload } = useAsync(
    () => getData(`/recipes/${encodeURIComponent(id)}`).then((response) => response.data),
    [id]
  );

  const steps = useMemo(() => recipe?.steps || [], [recipe]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState({});
  const [finished, setFinished] = useState(false);

  const current = steps[index];
  const duration = current?.durationSeconds || 0;

  // Reset the timer whenever the visible step changes.
  useEffect(() => {
    setSecondsLeft(duration);
    setRunning(false);
  }, [index, duration]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (running && secondsLeft === 0) setRunning(false);
  }, [running, secondsLeft]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((value) => Math.min(steps.length - 1, value + 1));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((value) => Math.max(0, value - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length]);

  if (loading && !recipe) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-soft">
        <Loading label="Menyiapkan mode memasak…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-24">
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
  const ingredients = recipe.ingredients || [];
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = steps.length ? ((finished ? steps.length : index) / steps.length) * 100 : 0;
  const isLast = index === steps.length - 1;

  const exitTo = food?.slug ? `/makanan/${food.slug}` : `/resep/${recipe._id}`;

  return (
    <div className="flex min-h-screen flex-col bg-cream-soft">
      <header className="sticky top-0 z-40 border-b border-cream/15 bg-cocoa text-cream-soft">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to={exitTo} className="inline-flex items-center gap-2 font-sans text-xs text-cream/70 hover:text-cream">
            <X size={16} />
            Keluar mode memasak
          </Link>
          <p className="hidden font-sans text-[11px] uppercase tracking-[0.22em] text-cream/50 sm:block">
            {recipe.title || `Resep ${food?.name || ''}`}
          </p>
          <Link
            to={`/resep/${recipe._id}`}
            className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-cream"
          >
            Lihat resep
          </Link>
        </div>
        <div className="h-1 w-full bg-cream/10">
          <div
            className="h-full bg-brick transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </header>

      <main className="container-page flex-1 py-8 sm:py-12">
        {!steps.length ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <ChefHat size={30} className="mx-auto text-brick" />
            <h1 className="mt-4 font-display text-2xl">Langkah belum tersedia</h1>
            <p className="mt-2 text-sm text-cocoa-soft">
              Resep ini belum memiliki langkah memasak yang dapat dipandu.
            </p>
            <Link to={`/resep/${recipe._id}`} className="btn-primary btn-sm mt-6">
              Kembali ke resep
            </Link>
          </div>
        ) : finished ? (
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal-soft text-teal-dark">
              <CheckCircle2 size={38} />
            </span>
            <h1 className="mt-6 font-display text-4xl">Selesai!</h1>
            <p className="mt-3 text-cocoa-soft">
              Anda telah menyelesaikan seluruh {steps.length} langkah resep{' '}
              <strong>{recipe.title || food?.name}</strong>.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={`/resep/${recipe._id}`} className="btn-primary">
                Kembali ke resep
              </Link>
              <button
                type="button"
                onClick={() => {
                  setFinished(false);
                  setIndex(0);
                }}
                className="btn-outline"
              >
                <RotateCcw size={15} />
                Ulangi dari awal
              </button>
            </div>
            <p className="mt-10 font-sans text-[11px] uppercase tracking-[0.2em] text-cocoa-faint">
              Catatan: resep berstatus draf perlu diverifikasi sebelum dijadikan acuan.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-brick">
                  Langkah {index + 1} dari {steps.length}
                </p>
                <div className="flex items-center gap-1.5">
                  {steps.map((step, stepIndex) => (
                    <button
                      key={stepIndex}
                      type="button"
                      onClick={() => setIndex(stepIndex)}
                      aria-label={`Ke langkah ${stepIndex + 1}`}
                      aria-current={stepIndex === index}
                      className={`h-2 rounded-full transition-all ${
                        stepIndex === index
                          ? 'w-7 bg-brick'
                          : stepIndex < index
                            ? 'w-2 bg-teal'
                            : 'w-2 bg-cocoa/15'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <article className="card mt-5 overflow-hidden">
                <div className="border-b border-line bg-cream/50 px-6 py-8 sm:px-10 sm:py-10">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brick font-display text-2xl text-cream-soft">
                    {current.stepNumber || index + 1}
                  </span>
                  <h1 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
                    {current.title || `Langkah ${index + 1}`}
                  </h1>
                </div>

                <div className="px-6 py-8 sm:px-10">
                  <p className="text-lg leading-relaxed text-cocoa/90 sm:text-xl">
                    {current.description}
                  </p>

                  {current.tips && (
                    <p className="mt-6 rounded-2xl border border-teal/20 bg-teal-soft/70 px-4 py-3 font-sans text-sm leading-relaxed text-teal-dark">
                      <strong>Tips:</strong> {current.tips}
                    </p>
                  )}

                  {duration > 0 && (
                    <div className="mt-8 rounded-2xl border border-line bg-cream/40 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-cocoa-faint">
                            <Timer size={12} />
                            Pengatur waktu langkah
                          </p>
                          <p className="mt-1 font-display text-4xl tabular-nums text-cocoa">
                            {formatSeconds(secondsLeft)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setRunning((value) => !value)}
                            className={running ? 'btn-outline btn-sm' : 'btn-teal btn-sm'}
                          >
                            {running ? <Pause size={14} /> : <Play size={14} />}
                            {running ? 'Jeda' : secondsLeft === 0 ? 'Ulangi' : 'Mulai'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRunning(false);
                              setSecondsLeft(duration);
                            }}
                            className="btn-ghost btn-sm border border-line"
                          >
                            <RotateCcw size={14} />
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setSecondsLeft((value) => value + 60)}
                            className="btn-ghost btn-sm border border-line"
                          >
                            <Plus size={14} />
                            1 mnt
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-10 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIndex((value) => Math.max(0, value - 1))}
                      disabled={index === 0}
                      className="btn-outline"
                    >
                      <ArrowLeft size={16} />
                      Sebelumnya
                    </button>

                    {isLast ? (
                      <button
                        type="button"
                        onClick={() => setFinished(true)}
                        className="btn-primary"
                      >
                        <CheckCircle2 size={16} />
                        Selesai
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
                        className="btn-primary"
                      >
                        Langkah berikutnya
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>

                  <p className="mt-5 text-center font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa-faint">
                    Gunakan tombol panah kiri/kanan pada papan ketik
                  </p>
                </div>
              </article>
            </div>

            <aside className="space-y-5">
              <div className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg">Bahan</h2>
                  <span className="font-sans text-[11px] text-cocoa-faint">
                    {checkedCount}/{ingredients.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-1">
                  {ingredients.map((item, itemIndex) => {
                    const label = item.ingredient?.name || item.name || 'Bahan';
                    const isChecked = Boolean(checked[itemIndex]);
                    return (
                      <li key={`${label}-${itemIndex}`}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-cocoa/5">
                          <span
                            className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                              isChecked
                                ? 'border-teal-dark bg-teal-dark text-cream-soft'
                                : 'border-cocoa/20 bg-cream-soft text-transparent'
                            }`}
                          >
                            <Check size={10} />
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setChecked((value) => ({ ...value, [itemIndex]: !value[itemIndex] }))
                            }
                            className="sr-only"
                          />
                          <span
                            className={`font-sans text-xs leading-relaxed ${
                              isChecked ? 'text-cocoa-faint line-through' : 'text-cocoa'
                            }`}
                          >
                            {item.quantity ? `${item.quantity} ` : ''}
                            {item.unit ? `${item.unit} ` : ''}
                            {label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {food?.mainImage?.url && (
                <div className="overflow-hidden rounded-3xl border border-line">
                  <img
                    src={mediaUrl(food.mainImage.url)}
                    alt={food.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <p className="bg-cream px-4 py-3 font-sans text-[11px] uppercase tracking-[0.16em] text-cocoa-soft">
                    {food.name}
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

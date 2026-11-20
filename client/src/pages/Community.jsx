import { useRef, useState } from 'react';
import {
  CheckCircle2,
  FileImage,
  Info,
  Mail,
  Send,
  ShieldCheck,
  Sprout,
  UploadCloud,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { SUBMISSION_TYPES } from '../utils/constants.js';

const INITIAL_FORM = {
  type: 'food-suggestion',
  name: '',
  email: '',
  title: '',
  description: '',
};

const PROCESS = [
  {
    title: 'Ditinjau editor',
    text: 'Setiap kiriman masuk antrean moderasi. Tidak ada konten yang langsung tayang.',
  },
  {
    title: 'Diverifikasi sumbernya',
    text: 'Editor menghubungi kontributor bila diperlukan klarifikasi atau izin penggunaan media.',
  },
  {
    title: 'Dipublikasikan',
    text: 'Jika disetujui, konten diolah menjadi entri katalog, cerita, atau bahan dengan kredit.',
  },
];

export default function Community() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onFiles = (event) => {
    const selected = Array.from(event.target.files || []).slice(0, 3);
    const oversized = selected.find((file) => file.size > 8 * 1024 * 1024);
    if (oversized) {
      toast.error('Salah satu berkas melebihi 8MB.');
      event.target.value = '';
      return;
    }
    setFiles(selected);
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Nama wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Format email belum benar.';
    }
    if (!form.title.trim()) next.title = 'Judul wajib diisi.';
    if (form.description.trim().length < 20) {
      next.description = 'Ceritakan sedikit lebih lengkap (minimal 20 karakter).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value.trim()));
      files.forEach((file) => payload.append('media', file));

      const response = await api.post('/community/submissions', payload);
      setSuccess(response.data?.data || {});
      setForm(INITIAL_FORM);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Kontribusi terkirim. Terima kasih!');
    } catch (error) {
      toast.error(error.message || 'Kontribusi gagal dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">Kontribusi komunitas</p>
          <div className="mt-4 max-w-3xl">
            <h1 className="display-2">Rasa yang dirawat bersama</h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa-soft">
              Punya usulan makanan, cerita keluarga, resep, atau dokumentasi foto? Kirimkan melalui
              formulir ini. Editor akan meninjau sebelum konten dipublikasikan.
            </p>
          </div>
        </div>
      </section>

      <section className="section pt-10">
        <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            {success ? (
              <div className="card p-8 text-center sm:p-12">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-soft text-teal-dark">
                  <CheckCircle2 size={30} />
                </span>
                <h2 className="mt-5 font-display text-3xl">Kontribusi diterima</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cocoa-soft">
                  Terima kasih. Kiriman Anda masuk ke antrean peninjauan editor. Kami akan
                  menghubungi melalui email bila diperlukan klarifikasi.
                </p>
                {success.id && (
                  <p className="mt-4 inline-block rounded-full bg-cream px-4 py-1.5 font-sans text-[11px] text-cocoa-soft">
                    Nomor referensi: {String(success.id).slice(-8).toUpperCase()}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSuccess(null)}
                    className="btn-primary"
                  >
                    Kirim kontribusi lain
                  </button>
                  <a href="/jelajah" className="btn-outline">
                    Jelajahi katalog
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl">Formulir kontribusi</h2>
                <p className="mt-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                  Kolom bertanda <span className="text-brick">*</span> wajib diisi. Email tidak akan
                  dipublikasikan.
                </p>

                <div className="mt-6 grid gap-5">
                  <label className="block">
                    <span className="label">
                      Jenis kontribusi <span className="text-brick">*</span>
                    </span>
                    <select value={form.type} onChange={update('type')} className="input">
                      {SUBMISSION_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">
                        Nama <span className="text-brick">*</span>
                      </span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Nama lengkap"
                        className="input"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && (
                        <span className="mt-1 block font-sans text-[11px] text-brick">{errors.name}</span>
                      )}
                    </label>

                    <label className="block">
                      <span className="label">
                        Email <span className="text-brick">*</span>
                      </span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        placeholder="nama@email.com"
                        className="input"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && (
                        <span className="mt-1 block font-sans text-[11px] text-brick">{errors.email}</span>
                      )}
                    </label>
                  </div>

                  <label className="block">
                    <span className="label">
                      Judul <span className="text-brick">*</span>
                    </span>
                    <input
                      type="text"
                      value={form.title}
                      onChange={update('title')}
                      placeholder="Misalnya: Resep lontong keluarga kami"
                      className="input"
                      aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && (
                      <span className="mt-1 block font-sans text-[11px] text-brick">{errors.title}</span>
                    )}
                  </label>

                  <label className="block">
                    <span className="label">
                      Cerita / keterangan <span className="text-brick">*</span>
                    </span>
                    <textarea
                      value={form.description}
                      onChange={update('description')}
                      rows={6}
                      placeholder="Jelaskan hidangan, bahan, proses, lokasi, dan sumber cerita…"
                      className="textarea"
                      aria-invalid={Boolean(errors.description)}
                    />
                    <span className="mt-1 flex justify-between font-sans text-[11px] text-cocoa-faint">
                      <span>{errors.description || 'Sertakan lokasi dan sumber bila ada.'}</span>
                      <span>{form.description.length}/6000</span>
                    </span>
                  </label>

                  <div>
                    <span className="label">Dokumentasi foto (opsional, maks. 3)</span>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cocoa/20 bg-cream/40 px-6 py-8 text-center transition-colors hover:border-teal/50">
                      <UploadCloud size={24} className="text-teal" />
                      <span className="mt-2 font-sans text-xs font-semibold text-cocoa">
                        Pilih foto atau seret ke sini
                      </span>
                      <span className="mt-1 font-sans text-[11px] text-cocoa-faint">
                        JPG, PNG, WEBP, AVIF, atau GIF · maks. 8MB per berkas
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        multiple
                        onChange={onFiles}
                        className="sr-only"
                      />
                    </label>

                    {files.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {files.map((file, index) => (
                          <li
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 rounded-xl border border-line bg-cream-soft/70 p-2.5"
                          >
                            <FileImage size={17} className="shrink-0 text-teal" />
                            <span className="min-w-0 flex-1 truncate font-sans text-xs text-cocoa">
                              {file.name}
                            </span>
                            <span className="font-sans text-[10px] text-cocoa-faint">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="grid h-6 w-6 place-items-center rounded-full text-cocoa-faint hover:bg-cocoa/5 hover:text-brick"
                              aria-label={`Hapus ${file.name}`}
                            >
                              <X size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-2 font-sans text-[11px] leading-relaxed text-cocoa-soft">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-teal" />
                    Dengan mengirim, Anda menyatakan berhak atas materi dan menyetujui peninjauan
                    editorial.
                  </p>
                  <button type="submit" disabled={submitting} className="btn-primary shrink-0">
                    <Send size={15} />
                    {submitting ? 'Mengirim…' : 'Kirim kontribusi'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-xl">Alur peninjauan</h2>
              <ol className="mt-4 space-y-4">
                {PROCESS.map((item, index) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brick-soft font-sans text-[11px] font-bold text-brick">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-sans text-sm font-semibold text-cocoa">{item.title}</p>
                      <p className="mt-1 font-sans text-xs leading-relaxed text-cocoa-soft">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Info size={17} className="text-teal" />
                Yang membantu peninjauan
              </h2>
              <ul className="mt-3 space-y-2 font-sans text-xs leading-relaxed text-cocoa-soft">
                <li>· Nama desa dan kecamatan asal hidangan.</li>
                <li>· Sumber cerita: keluarga, pedagang, atau arsip desa.</li>
                <li>· Perkiraan takaran bahan bila mengirim resep.</li>
                <li>· Izin narasumber untuk foto atau wawancara.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-cocoa p-6 text-cream-soft">
              <h2 className="flex items-center gap-2 font-display text-lg">
                <Mail size={16} className="text-teal" />
                Kontak
              </h2>
              <p className="mt-2 font-sans text-xs leading-relaxed text-cream/70">
                Alamat email pada halaman ini masih contoh. Ganti dengan kanal resmi pengelola
                sebelum peluncuran.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-cream/20 px-3 py-1.5 font-sans text-[11px] text-cream/80">
                <Sprout size={12} />
                halo@rasiboga.local
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

/**
 * Markdown-lite editor for article bodies with an "arsip foto" upload button.
 * Uploaded photos are inserted as `![alt](url "caption")` at the caret so the
 * public RichText renderer can show a responsive figure with a caption.
 */
export default function ArticleContentEditor({ value = '', onChange, rows = 12 }) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const caretRef = useRef(null);

  useEffect(() => {
    if (caretRef.current == null || !textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = null;
  }, [value]);

  const insertBlock = (block) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? start;
    const before = value.slice(0, start);
    const after = value.slice(end);

    let prefix = '';
    if (before) {
      prefix = before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    }
    const suffix = after ? `\n\n${after.replace(/^\n+/, '')}` : '';
    const next = `${before}${prefix}${block}${suffix}`;
    const caret = before.length + prefix.length + block.length;

    caretRef.current = caret;
    onChange(next);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const cleanCaption = caption.trim().replace(/["'\]\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
    const finalCaption = cleanCaption || 'Arsip dokumentasi RASIBOGA';
    const alt = `Foto arsip — ${finalCaption}`.replace(/\]/g, '');

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('folder', 'articles/archive');
      const response = await api.post('/uploads', payload);
      const url = response.data?.data?.url;
      if (!url) throw new Error('Server tidak mengembalikan URL berkas.');

      insertBlock(`![${alt}](${url} "${finalCaption}")`);
      setCaption('');
      toast.success('Foto arsip disisipkan ke isi artikel.');
    } catch (error) {
      toast.error(error.message || 'Gagal mengunggah foto arsip.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="admin-label">Isi artikel</span>

      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Keterangan arsip (opsional): tempat, tanggal, sumber…"
          className="admin-input flex-1"
          aria-label="Keterangan foto arsip"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-outline btn-sm shrink-0"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
          {uploading ? 'Mengunggah…' : 'Sisipkan foto arsip'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFile}
          className="sr-only"
        />
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="admin-input font-mono text-xs"
        placeholder={'## Subjudul\nParagraf artikel…\n![Foto arsip](https://… "Keterangan arsip")'}
      />

      <p className="mt-1 font-sans text-[10px] leading-relaxed text-cocoa-faint">
        Format: <code>##</code> subjudul, <code>###</code> subjudul kecil, <code>-</code> daftar,{' '}
        <code>**tebal**</code>. Foto arsip ditulis sebagai <code>![keterangan](url "caption")</code>{' '}
        pada baris tersendiri dan tampil sebagai gambar responsif dengan keterangan di halaman artikel.
      </p>
    </div>
  );
}

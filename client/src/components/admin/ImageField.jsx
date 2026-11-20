import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { mediaUrl } from '../../services/api.js';

/**
 * Media picker with local/Cloudinary upload through POST /api/uploads.
 * Works with either a media object ({ url, publicId }) or a plain URL string.
 */
export default function ImageField({
  label = 'Gambar',
  value,
  onChange,
  folder = 'uploads',
  stringValue = false,
  hint,
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const url = typeof value === 'string' ? value : value?.url || '';

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('folder', folder);
      const response = await api.post('/uploads', payload);
      const media = response.data?.data;
      if (!media?.url) throw new Error('Server tidak mengembalikan URL berkas.');

      onChange(
        stringValue
          ? media.url
          : { url: media.url, publicId: media.publicId, resourceType: media.resourceType }
      );
      toast.success('Berkas berhasil diunggah.');
    } catch (error) {
      toast.error(error.message || 'Gagal mengunggah berkas.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setManualUrl = (event) => {
    const next = event.target.value;
    onChange(stringValue ? next : { ...(value || {}), url: next });
  };

  return (
    <div>
      <span className="admin-label">{label}</span>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl border border-cocoa/15 bg-cream sm:w-40">
          {url ? (
            <img src={mediaUrl(url)} alt="Pratinjau" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-cocoa-faint">
              <ImagePlus size={22} className="mx-auto" />
              <span className="mt-1 block font-sans text-[10px] uppercase tracking-wider">
                Tanpa gambar
              </span>
            </div>
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-cream-soft/85">
              <Loader2 size={20} className="animate-spin text-brick" />
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={url}
            onChange={setManualUrl}
            placeholder="/assets/... atau https://…"
            className="admin-input"
            aria-label={`URL ${label}`}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-outline btn-sm"
            >
              <Upload size={13} />
              {uploading ? 'Mengunggah…' : url ? 'Ganti berkas' : 'Unggah berkas'}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => onChange(stringValue ? '' : { url: '', publicId: '', resourceType: '' })}
                className="btn-ghost btn-sm text-brick"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleUpload}
            className="sr-only"
          />

          <p className="font-sans text-[10px] leading-relaxed text-cocoa-faint">
            {hint ||
              'JPG, PNG, WEBP, AVIF, atau GIF. Tanpa konfigurasi Cloudinary, berkas disimpan di server/uploads.'}
          </p>
        </div>
      </div>
    </div>
  );
}

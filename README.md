# RASIBOGA

**Platform dokumentasi digital warisan kuliner Kabupaten Rembang.**
MVP MERN (MongoDB, Express, React, Node.js) yang menghubungkan makanan, resep, asal-usul bahan, peta gastronomi, cerita budaya, dan kontribusi komunitas dalam satu arsip yang dapat ditelusuri.

> Status: **MVP / konten draf**. Sebagian besar entri seed sengaja diberi label *Konten draf* dan koordinat contoh berstatus *belum terverifikasi*. Jangan menganggap isi seed sebagai dokumentasi resmi sebelum melalui verifikasi sumber dan lapangan.

---

## 1. Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS v4 |
| Animasi | GSAP (menghormati `prefers-reduced-motion`) |
| Peta | Leaflet + React Leaflet, tile OpenStreetMap |
| Ikon / notifikasi | Lucide React, react-hot-toast |
| Backend | Node.js, Express 4, Mongoose 8 |
| Auth | JWT di cookie `httpOnly`, bcryptjs |
| Media | Cloudinary (produksi) atau disk lokal `server/uploads` (pengembangan) |
| Validasi | express-validator, rate limit |
| Database | MongoDB Atlas / lokal, dengan fallback `mongodb-memory-server` untuk pengembangan |

### Sistem desain

| Peran | Nilai |
| --- | --- |
| Background utama | `#FFFAF5` (Rasa Ivory) |
| Background section / kartu | `#FDEFE3` (Rasa Cream) |
| Teks utama & heading | `#2E1F1B` (Rasa Brown) |
| Teks sekunder | `#7A6258` (Rasa Muted) |
| Aksen utama / CTA | `#B8232F` (Rasa Red), hover `#8E1A24` |
| Chip kategori | `#F0BFD0` (Rasa Pink) |
| Label terverifikasi / aksen sekunder | `#3F6B55` (Rasa Green), latar `#E4EFE9` |
| Border / garis | `#EBD9CB` (Rasa Border) |
| Heading & angka besar | Playfair Display 600/700 |
| Body, navigasi, tombol | Plus Jakarta Sans 400/500/600 |

Bayangan memakai cokelat transparan, mis. `rgba(46,31,27,.15)`. Token didefinisikan sekali di `client/src/index.css` (`@theme`), lalu dipakai lewat utility Tailwind seperti `bg-cream-soft`, `bg-cream`, `text-cocoa`, `text-cocoa-soft`, `bg-brick`, `bg-teal`, `bg-pink`, dan `border-line`. Aset SVG contoh memakai palet yang sama melalui `tools/generate-placeholders.mjs`.

---

## 2. Struktur proyek

```text
.
├─ client/                 # SPA React + Vite
│  ├─ public/assets/       # SEMUA aset contoh yang dapat diganti
│  └─ src/
│     ├─ components/       # common, cards, maps, layout, admin
│     ├─ context/          # AuthContext, BookmarkContext
│     ├─ pages/            # halaman publik
│     ├─ pages/admin/      # dashboard editor
│     ├─ services/api.js   # axios + envelope API
│     └─ utils/            # konstanta, format, glosarium
├─ server/                 # REST API Express
│  ├─ config/              # db, cloudinary
│  ├─ controllers/         # logika endpoint
│  ├─ data/seedData.js     # SUMBER KEBENARAN konten seed
│  ├─ middleware/          # auth, upload, validate, error
│  ├─ models/              # 8 model Mongoose
│  ├─ routes/              # peta endpoint
│  ├─ services/            # seed service
│  ├─ tests/smoke.mjs      # 49 pemeriksaan regresi API
│  └─ uploads/             # media lokal (dibuat otomatis)
├─ tools/
│  └─ generate-placeholders.mjs  # regenerasi aset contoh
└─ README.md
```

---

## 3. Menjalankan secara lokal

### Prasyarat

- **Node.js 20+** dan npm
- Tidak perlu akun MongoDB atau Cloudinary untuk mencoba aplikasi.

### Langkah cepat

```bash
# 1. Siapkan environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# 2. Pasang dependensi
npm run install:all

# 3. Terminal A — API
npm run dev:server

# 4. Terminal B — frontend
npm run dev:client
```

Buka **http://localhost:5173**.

Di PowerShell, jika `npm` gagal karena `npm.ps1 cannot be loaded`, gunakan `npm.cmd`:

```powershell
npm.cmd run install:all
npm.cmd run dev:server
npm.cmd run dev:client
```

### Yang terjadi saat pertama kali dijalankan

- Jika `MONGODB_URI` **kosong** dan `NODE_ENV=development`, server menyalakan MongoDB in-memory lalu mengisi data seed secara otomatis.
- **Data in-memory hilang setiap server dimulai ulang.** Ini hanya untuk eksplorasi.
- Jika `MONGODB_URI` diisi, server memakai database tersebut. Jalankan seed satu kali:

```bash
npm run seed        # isi jika koleksi masih kosong
npm run seed:reset  # hapus konten lalu seed ulang
```

> `npm run seed` tanpa `MONGODB_URI` akan membuat database in-memory baru, mengisinya, lalu mematikannya — datanya tidak tersimpan. Untuk data permanen, isi `MONGODB_URI` terlebih dahulu.

### Akun admin demo

```text
Email    : admin@rasiboga.local
Password : GantiSayaSegera123!
```

> **Ganti akun ini sebelum deploy.** Halaman **Admin → Pengaturan** menampilkan peringatan selama akun demo masih aktif.

---

## 4. Environment variables

### `server/.env`

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `PORT` | tidak | Default `5000`. |
| `NODE_ENV` | tidak | `development` atau `production`. |
| `MONGODB_URI` | produksi | Kosong di development ⇒ MongoDB in-memory. Wajib di production. |
| `MONGODB_DB_NAME` | tidak | Default `rasiboga_db`. |
| `CLIENT_URL` | produksi | Origin frontend yang diizinkan, pisahkan dengan koma. |
| `JWT_SECRET` | produksi | Di development, secret sementara dibuat otomatis. Wajib di production. |
| `JWT_EXPIRES_IN` | tidak | Default `7d`. |
| `CLOUDINARY_CLOUD_NAME` | tidak | Kosong ⇒ unggahan disimpan di `server/uploads`. |
| `CLOUDINARY_API_KEY` | tidak | — |
| `CLOUDINARY_API_SECRET` | tidak | — |
| `ADMIN_NAME` | tidak | Nama admin bootstrap. |
| `ADMIN_EMAIL` | tidak | Email admin bootstrap. |
| `ADMIN_PASSWORD` | tidak | Kata sandi admin bootstrap. |
| `MAX_IMAGE_MB` | tidak | Default `8`. |
| `MAX_VIDEO_MB` | tidak | Default `50`. |

Jangan pernah commit `server/.env`. Berkas `.gitignore` sudah mengecualikannya.

### `client/.env`

| Variabel | Keterangan |
| --- | --- |
| `VITE_API_URL` | Default `/api`. Di development, Vite mem-proxy `/api` dan `/uploads` ke `http://localhost:5000` agar cookie auth bekerja tanpa CORS. Di production, isi URL API lengkap, misalnya `https://api.contoh.id/api`. |

---

## 5. Perintah npm

Dari root:

| Perintah | Fungsi |
| --- | --- |
| `npm run install:all` | Pasang dependensi server dan client. |
| `npm run dev:server` | Jalankan API dengan nodemon. |
| `npm run dev:client` | Jalankan Vite. |
| `npm run build` | Build frontend ke `client/dist`. |
| `npm run smoke` | Jalankan 49 pemeriksaan regresi API. |
| `npm run seed` / `npm run seed:reset` | Seed database. |
| `npm run assets` | Regenerasi seluruh aset contoh SVG. |

Dari dalam `server/` atau `client/`, gunakan `npm run dev`, `npm run build`, `npm run smoke`, dan seterusnya.

---

## 6. Mengganti aset contoh (logo, gambar, peta)

Semua visual saat ini adalah **SVG contoh yang dapat diedit**. Berkas berada di `client/public/assets/`.

| Kebutuhan | Berkas contoh | Rasio / ukuran | Dipakai di |
| --- | --- | --- | --- |
| Logo utama | `logo-rasiboga.svg` | 420×96 | Materi brand, dapat dipakai eksternal |
| Mark / ikon logo | `logo-mark.svg` | 96×96 | Navbar, footer, intro |
| Favicon | `favicon.svg` | 96×96 | Tab browser |
| Gambar OG | `og-image.svg` | 1200×630 | Meta `og:image` |
| Pola dekoratif | `pattern.svg` | 120×120 (tile) | Latar section tertentu |
| Foto makanan | `foods/<slug>.svg` | 4:3 (800×600) | Kartu, detail makanan, peta |
| Fallback makanan | `food-placeholder.svg` | 4:3 | Bila gambar gagal dimuat |
| Foto bahan | `ingredients/<slug>.svg` | 1:1 (600×600) | Glosarium, detail makanan |
| Fallback bahan | `ingredients/placeholder.svg` | 1:1 | Bila gambar bahan kosong |
| Sampul artikel | `articles/article-1..3.svg` | 16:9 (1200×675) | Cerita & budaya |
| Thumbnail video | `videos/video-placeholder.svg` | 16:9 | Slot video |
| Ilustrasi peta | `map-placeholder.svg` | 800×500 | Materi pendukung / cadangan |

### Cara mengganti

**Opsi A — ganti berkas langsung (paling cepat, tanpa mengubah data)**

1. Siapkan gambar baru.
2. Ganti berkas di `client/public/assets/...` dengan **nama yang sama**.
3. Jika formatnya berbeda (mis. JPG), ubah juga URL di data. Cara termudah: gunakan **Opsi B**.

**Opsi B — unggah lewat dashboard (disarankan untuk produksi)**

1. Masuk ke `/admin`.
2. Buka **Makanan / Bahan / Artikel / Video**, lalu edit entri.
3. Gunakan kolom gambar untuk mengunggah berkas. Di development, berkas disimpan di `server/uploads/`; di production, di Cloudinary.
4. Simpan. URL media tercatat di database tanpa perlu menyentuh kode.

**Opsi C — ganti massal lewat seed**

Ubah `mainImage.url`, `image.url`, atau `coverImage` di `server/data/seedData.js`, lalu jalankan `npm run seed:reset` pada database permanen.

### Peta

Peta gastronomi adalah **Leaflet interaktif**, bukan gambar statis:

- Tile berasal dari OpenStreetMap (`tile.openstreetmap.org`). Jika jaringan memblokir tile, peta tampil abu-abu, tetapi marker dan daftar lokasi tetap bekerja.
- Koordinat contoh ada di `server/data/seedData.js` dan ditandai `unverified`.
- `map-placeholder.svg` bukan pengganti peta interaktif; berkas itu hanya ilustrasi pendukung.
- Untuk mengganti titik, edit **Admin → Lokasi** atau seed. Lokasi tanpa koordinat sengaja tidak ditampilkan di peta (contoh: Desa Pohlandak).

### Regenerasi aset contoh

```bash
npm run assets
```

Perintah ini menulis ulang seluruh aset SVG contoh dari `tools/generate-placeholders.mjs`. Jalankan hanya jika Anda belum mengganti aset secara manual.

---

## 7. Konten, sumber, dan status verifikasi

- **13 makanan** seed dengan label provenance: *Kuliner Khas Rembang*, *Resep Adaptasi*, atau *Resep Umum*.
- **9 resep** seed. Empat makanan sengaja **tidak memiliki resep**: Dumbeg, Kaoya Dudul, Ting Ting, dan Wedang Corong / Cemoi. UI menampilkan *“Resep belum terdokumentasi”* alih-alih mengarang resep.
- Asosiasi asal yang dipakai: Tuyuhan/Pancur (Lontong Tuyuhan), Pohlandak + Pancur (Dumbeg), pesisir Rembang, Sendangmulyo/Gunem (Kaoya Dudul), dan Lasem.
- Field `contentStatus` (`draft` / `verified`) pada makanan dan resep, serta `verificationStatus` pada bahan dan lokasi, ditampilkan sebagai badge di UI.
- Catatan draf resep diawali `DRAF KONTEN —`. Jangan hapus penanda ini sebelum sumber diverifikasi.
- Riwayat/filosofi yang belum ada sumbernya dibiarkan kosong dengan penjelasan, bukan diisi klaim fiktif.
- Koordinat contoh berasal dari layanan geokoding publik dan **bukan** batas wilayah resmi.
- Kontribusi komunitas tidak pernah otomatis tayang. Status “disetujui” hanya menandai lolos triase; editor tetap menyalin dan memverifikasi isi secara manual.

Sumber kebenaran konten seed: `server/data/seedData.js`.

---

## 8. Fitur utama

**Publik**

- Pengalaman intro dengan opsi lewati.
- Beranda dengan statistik, sorotan, katalog pilihan, resep, slot video, peta mini, dan cerita.
- Katalog dengan pencarian, filter kategori/provenance/kecamatan, urutan, dan paginasi.
- Detail makanan: provenance, status draf, asal, sumber, bahan terkait, resep, peta, video, dan rekomendasi.
- Detail resep + **mode memasak** langkah demi langkah dengan pengatur waktu per langkah dan dukungan tombol panah.
- Dua lapis peta gastronomi: asal makanan dan asal bahan, dengan filter kecamatan.
- Cerita & budaya, glosarium istilah + bahan, kontribusi komunitas, dan simpanan lokal (`localStorage`).
- Aksesibilitas: skip link, label form, fokus terlihat, `prefers-reduced-motion`.

**Admin** (`/admin`)

- Login cookie `httpOnly`, dashboard ringkasan, dan peringatan akun demo.
- CRUD makanan, resep, bahan, lokasi, video, artikel.
- Kategori bersifat taksonomi tetap (halaman baca-saja dengan jumlah entri).
- Moderasi kontribusi: filter status, catatan editor, setujui/tolak/kembalikan ke antrean.
- Pengaturan & daftar periksa kesiapan server (tanpa membocorkan secret).

---

## 9. Ringkasan API

Semua respons memakai envelope:

```json
{ "success": true, "data": {}, "meta": {} }
```

Error: `{ "success": false, "message": "...", "details": [] }`.

| Area | Endpoint utama |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Makanan | `GET /api/foods`, `GET /api/foods/:slug`, `POST/PUT/DELETE /api/foods` (admin) |
| Resep | `GET /api/recipes`, `GET /api/recipes/:id`, `POST/PUT/DELETE /api/recipes` (admin) |
| Bahan | `GET /api/ingredients`, `POST/PUT/DELETE` (admin) |
| Lokasi | `GET /api/locations`, `GET /api/locations/map`, CRUD (admin) |
| Video | `GET /api/videos`, CRUD (admin) |
| Artikel | `GET /api/articles`, `GET /api/articles/:slug`, CRUD (admin) |
| Kategori | `GET /api/categories` |
| Komunitas | `POST /api/community/submissions`, `GET /api/community/submissions` (admin), `PATCH /api/community/submissions/:id/status` (admin) |
| Upload | `POST /api/uploads` (admin) |
| Admin | `GET /api/admin/stats`, `GET /api/admin/settings` |

Catatan:

- Menghapus makanan yang masih dipakai resep/lokasi memerlukan `?cascade=true`.
- `GET /api/foods?includeDrafts=true` memerlukan cookie admin. Saat admin login, draf juga terlihat pada endpoint publik.
- Saat menguji API publik setelah login, kirim `anon: true` (lihat `server/tests/smoke.mjs`) agar draf tidak ikut terhitung.

---

## 10. Pengujian

```bash
npm run smoke
```

Smoke test menjalankan **49 pemeriksaan**: health, auth, katalog publik, detail, filter, CRUD admin, moderasi kontribusi, upload, dan otorisasi. Server harus berjalan di `http://localhost:5000`.

---

## 11. Deploy (Render Free + Atlas M0 + Cloudinary Free)

`render.yaml` sudah berisi blueprint untuk satu **Web Service** yang menyajikan SPA dan API dari origin yang sama.

1. Push repositori ke GitHub, lalu buat **Blueprint** di Render dan pilih repo `RASIBOGA-PROTOTYPE`.
2. Saat diminta, isi secret yang bertanda `sync: false`:
   - `MONGODB_URI` — connection string Atlas.
   - `JWT_SECRET` — secret acak, mis. dari `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `CLOUDINARY_API_SECRET` — API secret Cloudinary.
   - `ADMIN_PASSWORD` — kata sandi admin produksi.
3. Blueprint memakai service name `rasiboga`, sehingga `CLIENT_URL` di-set ke `https://rasiboga.onrender.com`. Jika Render memberi URL lain, ubah `CLIENT_URL` di dashboard lalu **Manual Deploy → Clear build cache & deploy**.
4. Render Free tidak menyediakan one-off job. Isi database **dari lokal sebelum/ sesudah deploy**:

   ```powershell
   $env:MONGODB_URI = '<connection string Atlas>'
   $env:MONGODB_DB_NAME = 'rasiboga'
   $env:ADMIN_EMAIL = 'rasiboga@project.com'
   $env:ADMIN_PASSWORD = '<kata sandi admin produksi>'
   npm.cmd run seed
   ```

5. Verifikasi `https://rasiboga.onrender.com/api/health`, beranda, splash, katalog, dan `/admin/login`.
6. Cloudinary wajib untuk unggahan karena filesystem Render bersifat ephemeral. Render Free juga melakukan spin-down setelah ±15 menit idle; request pertama setelah itu membutuhkan waktu ±1 menit.

> Jangan pernah commit `server/.env`, `client/.env`, atau nilai secret ke repositori. Semua secret hanya ada di environment Render dan environment lokal saat seeding.

---

## 12. Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| `npm.ps1 cannot be loaded` di PowerShell | Gunakan `npm.cmd ...`. |
| Login gagal dengan akun demo | Pastikan API berjalan (`http://localhost:5000/api/health`), buka `http://localhost:5173/admin/login` (bukan port preview), lalu salin email/kata sandi persis tanpa spasi tambahan. Di halaman login mode development tersedia tombol **Isi otomatis**. |
| Login mengembalikan `429` | Ada 8 percobaan gagal per IP dalam 10 menit. Tunggu 10 menit atau restart server development untuk mereset penghitung. |
| Login berhasil di API tetapi gagal di browser | Jangan membuka `client/dist` lewat `vite preview` tanpa proxy `/api`; gunakan `npm.cmd run dev:client`, atau set `VITE_API_URL` ke origin API dan tambahkan origin tersebut ke `CLIENT_URL`. |
| Password admin berubah setelah mengubah `.env` | Seed hanya membuat admin saat koleksi masih kosong. Untuk database permanen, ubah kata sandi lewat seed ulang atau koleksi `admins`; untuk in-memory, cukup restart server. |
| Peta abu-abu tanpa tile | Jaringan memblokir `tile.openstreetmap.org`. Marker, filter, dan daftar lokasi tetap berfungsi. |
| Console menampilkan `401 /api/auth/me` | Tidak seharusnya terjadi: AuthContext hanya mengecek sesi bila cookie petunjuk `rasiboga_auth` ada. Pastikan build frontend dan server sudah memakai commit terbaru. |
| Data hilang setiap restart | `MONGODB_URI` kosong ⇒ in-memory. Isi URI permanen lalu seed. |
| Gambar unggahan tidak muncul | Di development, pastikan `server/uploads/` dapat diakses dan proxy `/uploads` aktif. |
| `npm run seed` seolah tidak menyimpan data | Tanpa `MONGODB_URI`, seed berjalan di database in-memory yang langsung dimatikan. |
| Draf tidak terlihat di situs publik | Draf hanya tampil untuk admin yang login; ini disengaja. |

---

## 13. Kredit & lisensi

Konten budaya wajib mencantumkan sumber. Aset visual di repositori ini adalah **contoh** dan tidak boleh dipakai sebagai dokumentasi resmi tanpa izin.

Tambahkan lisensi, nama pengelola, dan kanal kontak resmi sebelum publikasi.

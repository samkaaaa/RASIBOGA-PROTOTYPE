/**
 * Seed content for RASIBOGA.
 *
 * IMPORTANT CONTENT POLICY
 * ------------------------
 * Only the food names, categories, provenance labels and the origin
 * associations listed in the product brief are used as facts. Everything
 * else (history, philosophy, full recipes) is an explicitly labelled DRAFT
 * that must be verified with local practitioners / UMKM before publishing.
 * Food & recipe records therefore start with `contentStatus: 'draft'`.
 *
 * Coordinates are approximate points from the GeoNames dataset (via the
 * Open-Meteo geocoding API) and are marked `unverified`. Replace them with
 * field-verified coordinates through the admin dashboard.
 */

export const locationsSeed = [
  {
    key: 'tuyuhan',
    name: 'Desa Tuyuhan',
    village: 'Tuyuhan',
    district: 'Pancur',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.7215, lng: 111.4684 },
    locationType: ['food-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik: koordinat masih berada pada pusat Kecamatan Pancur, belum titik desa. Ganti dengan koordinat hasil verifikasi lapangan.',
  },
  {
    key: 'pohlandak',
    name: 'Desa Pohlandak',
    village: 'Pohlandak',
    district: 'Pancur',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: null, lng: null },
    locationType: ['food-origin'],
    verificationStatus: 'unverified',
    description:
      'Koordinat belum tersedia. Lokasi tetap tampil di daftar, tetapi tidak muncul sebagai marker peta.',
  },
  {
    key: 'pesisir-rembang',
    name: 'Pesisir Rembang',
    village: '',
    district: 'Rembang',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.707, lng: 111.3498 },
    locationType: ['food-origin', 'ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik: pusat Kota Rembang sebagai acuan kawasan pesisir. Titik spesifik menunggu verifikasi.',
  },
  {
    key: 'sendangmulyo',
    name: 'Desa Sendangmulyo',
    village: 'Sendangmulyo',
    district: 'Gunem',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.8141, lng: 111.4464 },
    locationType: ['food-origin', 'ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik desa dari dataset GeoNames. Perlu verifikasi lapangan sebelum ditandai verified.',
  },
  {
    key: 'lasem',
    name: 'Lasem',
    village: '',
    district: 'Lasem',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.6922, lng: 111.4527 },
    locationType: ['food-origin', 'ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik pusat Kecamatan Lasem. Digunakan sebagai acuan kawasan, bukan alamat produksi.',
  },
  {
    key: 'pancur',
    name: 'Kecamatan Pancur',
    village: '',
    district: 'Pancur',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.7215, lng: 111.4684 },
    locationType: ['ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik pusat kecamatan untuk bahan pangan lokal. Perlu detail desa/kelompok tani.',
  },
  {
    key: 'gunem',
    name: 'Kecamatan Gunem',
    village: '',
    district: 'Gunem',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.807, lng: 111.4656 },
    locationType: ['ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik pusat kecamatan. Diperlukan data produsen/kelompok tani untuk verifikasi.',
  },
  {
    key: 'rembang-kota',
    name: 'Kota Rembang',
    village: '',
    district: 'Rembang',
    regency: 'Rembang',
    province: 'Jawa Tengah',
    coordinates: { lat: -6.707, lng: 111.3498 },
    locationType: ['food-origin', 'ingredient-origin'],
    verificationStatus: 'unverified',
    description:
      'Contoh titik pusat kabupaten. Pasar dan UMKM perlu didata satu per satu.',
  },
];

export const ingredientsSeed = [
  {
    key: 'beras',
    name: 'Beras',
    description: 'Bahan dasar lontong dan nasi. Contoh data; asal pasokan belum diverifikasi.',
    originKeys: ['pancur'],
  },
  {
    key: 'santan',
    name: 'Santan',
    description: 'Santan kelapa untuk kuah gurih. Contoh data; asal kelapa belum diverifikasi.',
    originKeys: ['gunem'],
  },
  {
    key: 'ayam-kampung',
    name: 'Ayam Kampung',
    description: 'Ayam kampung untuk kuah dan lauk. Contoh data.',
    originKeys: ['pancur'],
  },
  {
    key: 'bawang-merah',
    name: 'Bawang Merah',
    description: 'Bumbu dasar hampir seluruh masakan. Contoh data; pasokan sering berasal dari luar daerah.',
    originKeys: [],
  },
  {
    key: 'bawang-putih',
    name: 'Bawang Putih',
    description: 'Bumbu dasar untuk menumis. Contoh data.',
    originKeys: [],
  },
  {
    key: 'cabai-merah',
    name: 'Cabai Merah',
    description: 'Pemberi rasa pedas. Contoh data.',
    originKeys: ['gunem'],
  },
  {
    key: 'kunyit',
    name: 'Kunyit',
    description: 'Bumbu pewarna dan pemberi aroma. Contoh data.',
    originKeys: [],
  },
  {
    key: 'lengkuas',
    name: 'Lengkuas',
    description: 'Bumbu aromatik untuk mengurangi bau amis. Contoh data.',
    originKeys: [],
  },
  {
    key: 'daun-salam',
    name: 'Daun Salam',
    description: 'Daun aromatik untuk kuah dan tumisan. Contoh data.',
    originKeys: [],
  },
  {
    key: 'serai',
    name: 'Serai',
    description: 'Batang aromatik untuk kuah santan. Contoh data.',
    originKeys: [],
  },
  {
    key: 'gula-jawa',
    name: 'Gula Jawa',
    description: 'Pemanis tradisional dari nira kelapa. Contoh data.',
    originKeys: ['gunem'],
  },
  {
    key: 'asam-jawa',
    name: 'Asam Jawa',
    description: 'Bahan utama permen asem dan pemberi rasa segar. Contoh data.',
    originKeys: [],
  },
  {
    key: 'kacang-hijau',
    name: 'Kacang Hijau',
    description: 'Isian kue ku dan bahan jajanan manis. Contoh data.',
    originKeys: [],
  },
  {
    key: 'tepung-ketan',
    name: 'Tepung Ketan',
    description: 'Bahan kulit kue ku dan ronde. Contoh data.',
    originKeys: [],
  },
  {
    key: 'jahe',
    name: 'Jahe',
    description: 'Rempah penghangat untuk wedang. Contoh data.',
    originKeys: [],
  },
  {
    key: 'kerang',
    name: 'Kerang (Kelo)',
    description: 'Hasil laut yang dikaitkan dengan kawasan pesisir Rembang. Contoh data.',
    originKeys: ['pesisir-rembang'],
  },
  {
    key: 'merica',
    name: 'Merica',
    description: 'Rempah pedas hangat; menjadi ciri sajian "mrico". Contoh data.',
    originKeys: [],
  },
  {
    key: 'kelapa-muda',
    name: 'Kelapa Muda',
    description: 'Isian minuman dingin. Contoh data.',
    originKeys: ['pesisir-rembang'],
  },
  {
    key: 'daging-sapi',
    name: 'Daging Sapi',
    description: 'Bahan utama bakso dan sup. Contoh data; asal ternak belum diverifikasi.',
    originKeys: [],
  },
  {
    key: 'tepung-tapioka',
    name: 'Tepung Tapioka',
    description: 'Bahan pengikat pada bakso. Contoh data.',
    originKeys: [],
  },
  {
    key: 'sawi-hijau',
    name: 'Sawi Hijau',
    description: 'Sayuran pelengkap bakso. Contoh data.',
    originKeys: [],
  },
  {
    key: 'mie-kuning',
    name: 'Mie Kuning',
    description: 'Pelengkap hidangan berkuah. Contoh data.',
    originKeys: [],
  },
  {
    key: 'gula-pasir',
    name: 'Gula Pasir',
    description: 'Pemanis untuk jajanan dan minuman. Contoh data.',
    originKeys: [],
  },
  {
    key: 'air',
    name: 'Air',
    description: 'Bahan dasar kuah dan larutan gula. Contoh data.',
    originKeys: [],
  },
  {
    key: 'wortel',
    name: 'Wortel',
    description: 'Sayuran untuk sup. Contoh data.',
    originKeys: [],
  },
  {
    key: 'kentang',
    name: 'Kentang',
    description: 'Sayuran untuk sup. Contoh data.',
    originKeys: [],
  },
  {
    key: 'tomat',
    name: 'Tomat',
    description: 'Pemberi warna dan rasa segar pada kuah. Contoh data.',
    originKeys: [],
  },
  {
    key: 'nasi-putih',
    name: 'Nasi Putih',
    description: 'Bahan utama nasi goreng. Contoh data.',
    originKeys: ['pancur'],
  },
  {
    key: 'telur-ayam',
    name: 'Telur Ayam',
    description: 'Pelengkap dan sumber protein. Contoh data.',
    originKeys: [],
  },
  {
    key: 'daun-bawang',
    name: 'Daun Bawang',
    description: 'Pelengkap aroma dan tampilan. Contoh data.',
    originKeys: [],
  },
  {
    key: 'kacang-tanah',
    name: 'Kacang Tanah',
    description: 'Isian ronde dan bahan jajanan. Contoh data.',
    originKeys: [],
  },
  {
    key: 'agar-agar',
    name: 'Agar-agar',
    description: 'Bahan dasar isian minuman dingin. Contoh data.',
    originKeys: [],
  },
  {
    key: 'sirup-cocopandan',
    name: 'Sirup Cocopandan',
    description: 'Pemberi rasa dan warna pada minuman. Contoh data.',
    originKeys: [],
  },
  {
    key: 'es-batu',
    name: 'Es Batu',
    description: 'Pendingin sajian. Contoh data.',
    originKeys: [],
  },
];


const DRAFT_NOTE =
  'DRAF KONTEN — resep ini adalah kerangka awal yang disusun untuk pengembangan produk. Wajib diverifikasi bersama narasumber/UMKM setempat sebelum ditandai terverifikasi.';

const placeholderHistory = '';
const placeholderPhilosophy = '';

export const foodsSeed = [
  {
    name: 'Lontong Tuyuhan',
    slug: 'lontong-tuyuhan',
    category: 'Makanan Berat',
    provenance: { type: 'local' },
    originKey: 'tuyuhan',
    featured: true,
    description:
      'Lontong dengan kuah santan yang dikaitkan dengan Desa Tuyuhan, Kecamatan Pancur, Kabupaten Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 30,
      cookingTime: 90,
      difficulty: 'Sedang',
      ingredients: [
        { key: 'beras', quantity: 500, unit: 'gram' },
        { key: 'ayam-kampung', quantity: 800, unit: 'gram' },
        { key: 'santan', quantity: 800, unit: 'ml' },
        { key: 'bawang-merah', quantity: 8, unit: 'siung' },
        { key: 'bawang-putih', quantity: 5, unit: 'siung' },
        { key: 'kunyit', quantity: 3, unit: 'cm' },
        { key: 'lengkuas', quantity: 3, unit: 'cm' },
        { key: 'daun-salam', quantity: 3, unit: 'lembar' },
        { key: 'serai', quantity: 2, unit: 'batang' },
        { key: 'gula-jawa', quantity: 1, unit: 'sdm' },
      ],
      equipment: ['Panci', 'Kukusan', 'Wajan', 'Ulekan atau blender', 'Cetakan lontong / daun pisang'],
      steps: [
        {
          title: 'Siapkan beras',
          description: 'Cuci beras hingga air cucian relatif jernih, lalu tiriskan.',
          durationSeconds: 300,
          tips: 'Gunakan beras yang sudah direndam 30 menit agar lontong lebih padat.',
        },
        {
          title: 'Bungkus lontong',
          description: 'Masukkan beras ke cetakan atau bungkus daun pisang, padatkan, lalu ikat kuat.',
          durationSeconds: 900,
        },
        {
          title: 'Kukus lontong',
          description: 'Kukus lontong selama kurang lebih 60 menit hingga matang, lalu angkat dan dinginkan.',
          durationSeconds: 3600,
          tips: 'Pastikan air kukusan tidak habis; tambahkan air panas bila perlu.',
        },
        {
          title: 'Haluskan dan tumis bumbu',
          description:
            'Haluskan bawang merah, bawang putih, dan kunyit. Tumis bersama lengkuas, daun salam, dan serai hingga harum.',
          durationSeconds: 600,
        },
        {
          title: 'Masak kuah',
          description:
            'Masukkan ayam, aduk hingga berubah warna, tuang santan, bumbui garam dan gula jawa, masak hingga ayam empuk.',
          durationSeconds: 2400,
          tips: 'Aduk perlahan agar santan tidak pecah.',
        },
        {
          title: 'Sajikan',
          description: 'Potong lontong, siram dengan kuah dan ayam, sajikan hangat.',
          durationSeconds: 300,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Dumbeg',
    slug: 'dumbeg',
    category: 'Jajanan Tradisional',
    provenance: { type: 'local' },
    originKey: 'pohlandak',
    featured: true,
    description:
      'Sajian tradisional yang dikaitkan dengan wilayah Rembang, antara lain Desa Pohlandak dan Kecamatan Pancur.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: null,
  },
  {
    name: 'Kelo Mrico',
    slug: 'kelo-mrico',
    category: 'Makanan Berat',
    provenance: { type: 'local' },
    originKey: 'pesisir-rembang',
    featured: true,
    description:
      'Sajian berbahan dasar kerang dengan bumbu merica, dikaitkan dengan kawasan pesisir Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 25,
      cookingTime: 30,
      difficulty: 'Sedang',
      ingredients: [
        { key: 'kerang', quantity: 1, unit: 'kg' },
        { key: 'santan', quantity: 400, unit: 'ml' },
        { key: 'bawang-merah', quantity: 6, unit: 'siung' },
        { key: 'bawang-putih', quantity: 4, unit: 'siung' },
        { key: 'merica', quantity: 1, unit: 'sdt' },
        { key: 'cabai-merah', quantity: 5, unit: 'buah' },
        { key: 'lengkuas', quantity: 2, unit: 'cm' },
        { key: 'daun-salam', quantity: 2, unit: 'lembar' },
      ],
      equipment: ['Wajan', 'Panci', 'Ulekan'],
      steps: [
        {
          title: 'Bersihkan kerang',
          description: 'Cuci kerang, rendam sebentar, lalu tiriskan.',
          durationSeconds: 900,
          tips: 'Buang kerang yang cangkangnya terbuka dan tidak menutup kembali.',
        },
        {
          title: 'Haluskan bumbu',
          description: 'Haluskan bawang merah, bawang putih, merica, dan cabai merah.',
          durationSeconds: 300,
        },
        {
          title: 'Tumis bumbu',
          description: 'Tumis bumbu halus bersama lengkuas dan daun salam hingga harum.',
          durationSeconds: 300,
        },
        {
          title: 'Masak kerang',
          description: 'Masukkan kerang, aduk, tuang santan, bumbui garam, masak hingga kerang matang.',
          durationSeconds: 900,
          tips: 'Jangan memasak terlalu lama agar kerang tidak alot.',
        },
        {
          title: 'Sajikan',
          description: 'Angkat dan sajikan hangat bersama nasi.',
          durationSeconds: 120,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Kaoya Dudul',
    slug: 'kaoya-dudul',
    category: 'Makanan Berat',
    provenance: { type: 'local' },
    originKey: 'sendangmulyo',
    featured: false,
    description:
      'Sajian tradisional yang dikaitkan dengan Desa Sendangmulyo, Kecamatan Gunem, Kabupaten Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: null,
  },
  {
    name: 'Bakso Lempit',
    slug: 'bakso-lempit',
    category: 'Makanan Berat',
    provenance: { type: 'local' },
    originKey: 'lasem',
    featured: true,
    description:
      'Bakso dengan bentuk pipih yang dikaitkan dengan Lasem, Kabupaten Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 40,
      cookingTime: 30,
      difficulty: 'Sedang',
      ingredients: [
        { key: 'daging-sapi', quantity: 500, unit: 'gram' },
        { key: 'tepung-tapioka', quantity: 100, unit: 'gram' },
        { key: 'bawang-putih', quantity: 4, unit: 'siung' },
        { key: 'merica', quantity: 1, unit: 'sdt' },
        { key: 'sawi-hijau', quantity: 200, unit: 'gram' },
        { key: 'mie-kuning', quantity: 200, unit: 'gram' },
      ],
      equipment: ['Food processor / ulekan', 'Panci', 'Wajan kecil'],
      steps: [
        {
          title: 'Haluskan adonan',
          description:
            'Haluskan daging sapi bersama bawang putih, merica, garam, dan es batu hingga lembut.',
          durationSeconds: 600,
          tips: 'Jaga adonan tetap dingin agar tekstur bakso kenyal.',
        },
        {
          title: 'Campur tepung',
          description: 'Tambahkan tepung tapioka sedikit demi sedikit sambil diaduk hingga rata.',
          durationSeconds: 300,
        },
        {
          title: 'Bentuk pipih',
          description: 'Ambil adonan, bentuk pipih dengan sendok atau telapak tangan.',
          durationSeconds: 900,
        },
        {
          title: 'Rebus dalam kaldu',
          description: 'Masukkan bakso ke kaldu mendidih, masak hingga mengapung dan matang.',
          durationSeconds: 900,
        },
        {
          title: 'Sajikan',
          description: 'Sajikan bakso bersama mie kuning, sawi hijau, dan kuah kaldu.',
          durationSeconds: 300,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Permen Asem',
    slug: 'permen-asem',
    category: 'Jajanan Tradisional',
    provenance: { type: 'adaptation' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Permen tradisional berbahan asam jawa dan gula.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 10,
      preparationTime: 10,
      cookingTime: 20,
      difficulty: 'Mudah',
      ingredients: [
        { key: 'asam-jawa', quantity: 200, unit: 'gram' },
        { key: 'gula-pasir', quantity: 300, unit: 'gram' },
        { key: 'air', quantity: 200, unit: 'ml' },
      ],
      equipment: ['Panci', 'Saringan', 'Sendok', 'Cetakan atau loyang'],
      steps: [
        {
          title: 'Larutkan asam',
          description: 'Rendam asam jawa dalam air hangat, remas, lalu saring airnya.',
          durationSeconds: 600,
        },
        {
          title: 'Masak larutan',
          description: 'Masak air asam bersama gula dan sedikit garam hingga mengental.',
          durationSeconds: 900,
          tips: 'Gunakan api sedang dan aduk agar tidak gosong.',
        },
        {
          title: 'Cetak',
          description: 'Teteskan adonan ke cetakan atau loyang yang dialasi kertas, biarkan mengeras.',
          durationSeconds: 600,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Wedang Corong / Cemoi',
    slug: 'wedang-corong-cemoi',
    category: 'Minuman',
    provenance: { type: 'adaptation' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Minuman hangat tradisional yang dikenal di Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: null,
  },
  {
    name: 'Sop Merah',
    slug: 'sop-merah',
    category: 'Makanan Berat',
    provenance: { type: 'general' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Sup dengan kuah berwarna merah, umumnya berisi sayuran dan daging.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 20,
      cookingTime: 40,
      difficulty: 'Mudah',
      ingredients: [
        { key: 'daging-sapi', quantity: 400, unit: 'gram' },
        { key: 'wortel', quantity: 2, unit: 'buah' },
        { key: 'kentang', quantity: 2, unit: 'buah' },
        { key: 'tomat', quantity: 2, unit: 'buah' },
        { key: 'bawang-merah', quantity: 5, unit: 'siung' },
        { key: 'bawang-putih', quantity: 3, unit: 'siung' },
        { key: 'merica', quantity: 1, unit: 'sdt' },
        { key: 'air', quantity: 1500, unit: 'ml' },
      ],
      equipment: ['Panci', 'Wajan', 'Ulekan'],
      steps: [
        {
          title: 'Rebus daging',
          description: 'Rebus daging hingga empuk, buang kotoran yang mengapung.',
          durationSeconds: 1800,
        },
        {
          title: 'Tumis bumbu',
          description: 'Haluskan bawang merah, bawang putih, dan merica, lalu tumis hingga harum.',
          durationSeconds: 300,
        },
        {
          title: 'Masak sayuran',
          description: 'Masukkan tumisan bumbu dan sayuran ke kaldu, masak hingga sayur matang.',
          durationSeconds: 900,
        },
        {
          title: 'Tambahkan tomat',
          description: 'Masukkan tomat agar kuah berwarna merah, bumbui garam, koreksi rasa.',
          durationSeconds: 300,
          tips: 'Warna kuah dapat berbeda antar rumah tangga, tergantung penggunaan tomat dan bumbu.',
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Nasi Goreng Putih',
    slug: 'nasi-goreng-putih',
    category: 'Makanan Berat',
    provenance: { type: 'general' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Nasi goreng tanpa kecap manis sehingga tampilannya putih.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 2,
      preparationTime: 10,
      cookingTime: 15,
      difficulty: 'Mudah',
      ingredients: [
        { key: 'nasi-putih', quantity: 400, unit: 'gram' },
        { key: 'telur-ayam', quantity: 2, unit: 'butir' },
        { key: 'bawang-putih', quantity: 3, unit: 'siung' },
        { key: 'bawang-merah', quantity: 3, unit: 'siung' },
        { key: 'daun-bawang', quantity: 2, unit: 'batang' },
        { key: 'merica', quantity: 1, unit: 'sdt' },
      ],
      equipment: ['Wajan', 'Spatula'],
      steps: [
        {
          title: 'Siapkan bumbu',
          description: 'Cincang bawang merah dan bawang putih, iris daun bawang.',
          durationSeconds: 300,
        },
        {
          title: 'Tumis bumbu',
          description: 'Tumis bawang hingga harum, masukkan telur dan orak-arik.',
          durationSeconds: 300,
        },
        {
          title: 'Goreng nasi',
          description: 'Masukkan nasi, bumbui garam dan merica, aduk rata dengan api besar.',
          durationSeconds: 480,
          tips: 'Gunakan nasi yang sudah didinginkan agar tidak lengket.',
        },
        {
          title: 'Sajikan',
          description: 'Tambahkan daun bawang, aduk sebentar, sajikan hangat.',
          durationSeconds: 120,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Ting Ting',
    slug: 'ting-ting',
    category: 'Jajanan Tradisional',
    provenance: { type: 'adaptation' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Jajanan tradisional manis yang dikenal di Rembang.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: null,
  },
  {
    name: 'Kue Ku',
    slug: 'kue-ku',
    category: 'Jajanan Tradisional',
    provenance: { type: 'general' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Kue basah tradisional berbentuk menyerupai cangkang kura-kura dengan isian kacang hijau.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 8,
      preparationTime: 40,
      cookingTime: 30,
      difficulty: 'Sedang',
      ingredients: [
        { key: 'tepung-ketan', quantity: 250, unit: 'gram' },
        { key: 'santan', quantity: 200, unit: 'ml' },
        { key: 'kacang-hijau', quantity: 200, unit: 'gram' },
        { key: 'gula-pasir', quantity: 100, unit: 'gram' },
        { key: 'gula-jawa', quantity: 50, unit: 'gram' },
      ],
      equipment: ['Kukusan', 'Cetakan kue ku', 'Wajan'],
      steps: [
        {
          title: 'Buat isian',
          description: 'Kukus kacang hijau, haluskan, lalu masak bersama gula dan sedikit santan hingga kalis.',
          durationSeconds: 1200,
        },
        {
          title: 'Buat kulit',
          description: 'Campur tepung ketan, santan hangat, gula, dan garam, uleni hingga kalis.',
          durationSeconds: 600,
        },
        {
          title: 'Bentuk kue',
          description: 'Isi cetakan dengan kulit, tambahkan isian kacang hijau, tutup dan padatkan.',
          durationSeconds: 900,
        },
        {
          title: 'Kukus',
          description: 'Kukus kue selama kurang lebih 20 menit hingga matang.',
          durationSeconds: 1200,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Wedang Ronde',
    slug: 'wedang-ronde',
    category: 'Minuman',
    provenance: { type: 'general' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Minuman hangat berisi bola-bola ketan dengan kuah jahe.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 30,
      cookingTime: 20,
      difficulty: 'Mudah',
      ingredients: [
        { key: 'tepung-ketan', quantity: 200, unit: 'gram' },
        { key: 'kacang-tanah', quantity: 100, unit: 'gram' },
        { key: 'gula-jawa', quantity: 100, unit: 'gram' },
        { key: 'jahe', quantity: 5, unit: 'cm' },
        { key: 'air', quantity: 800, unit: 'ml' },
      ],
      equipment: ['Panci', 'Mangkuk', 'Ulekan'],
      steps: [
        {
          title: 'Buat isian',
          description: 'Sangrai kacang tanah, haluskan, campur dengan gula dan sedikit air hingga bisa dibentuk.',
          durationSeconds: 600,
        },
        {
          title: 'Buat bola ronde',
          description: 'Uleni tepung ketan dengan air hangat, bentuk bola, isi dengan kacang, tutup rapat.',
          durationSeconds: 900,
        },
        {
          title: 'Rebus ronde',
          description: 'Rebus bola ronde dalam air mendidih hingga mengapung, angkat.',
          durationSeconds: 480,
        },
        {
          title: 'Masak kuah jahe',
          description: 'Rebus air dengan jahe dan gula jawa hingga harum, saring bila perlu.',
          durationSeconds: 600,
        },
        {
          title: 'Sajikan',
          description: 'Tuang kuah jahe ke mangkuk, tambahkan ronde, sajikan hangat.',
          durationSeconds: 120,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
  {
    name: 'Es Sarang Burung',
    slug: 'es-sarang-burung',
    category: 'Minuman',
    provenance: { type: 'general' },
    originKey: 'rembang-kota',
    featured: false,
    description: 'Minuman dingin manis yang disajikan dengan es.',
    history: placeholderHistory,
    philosophy: placeholderPhilosophy,
    sources: [],
    recipe: {
      servings: 4,
      preparationTime: 20,
      cookingTime: 10,
      difficulty: 'Mudah',
      ingredients: [
        { key: 'agar-agar', quantity: 1, unit: 'bungkus' },
        { key: 'kelapa-muda', quantity: 200, unit: 'gram' },
        { key: 'gula-pasir', quantity: 100, unit: 'gram' },
        { key: 'sirup-cocopandan', quantity: 100, unit: 'ml' },
        { key: 'es-batu', quantity: 200, unit: 'gram' },
      ],
      equipment: ['Panci', 'Cetakan agar-agar', 'Gelas saji'],
      steps: [
        {
          title: 'Masak agar-agar',
          description: 'Masak agar-agar dengan air dan gula hingga mendidih, tuang ke cetakan, dinginkan.',
          durationSeconds: 600,
        },
        {
          title: 'Potong agar-agar',
          description: 'Setelah mengeras, potong agar-agar memanjang menyerupai serat.',
          durationSeconds: 300,
        },
        {
          title: 'Susun sajian',
          description: 'Tata agar-agar, kelapa muda, dan es batu di gelas, tuang sirup, sajikan dingin.',
          durationSeconds: 180,
        },
      ],
      notes: DRAFT_NOTE,
    },
  },
];

export const articlesSeed = [
  {
    title: 'Menjaga Rasa, Merawat Ingatan',
    slug: 'menjaga-rasa-merawat-ingatan',
    excerpt:
      'Mengapa dokumentasi kuliner lokal penting, dan bagaimana sebuah platform digital dapat membantu merawatnya.',
    category: 'Budaya',
    coverImage: '/assets/articles/article-1.svg',
    content: `Kuliner bukan hanya soal rasa. Di dalamnya tersimpan cara orang memilih bahan, mengolah, dan berbagi hidangan dari satu generasi ke generasi berikutnya.

## Dokumentasi sebagai bentuk perawatan
Pengetahuan dapur sering berpindah melalui percakapan, bukan melalui catatan. Ketika percakapan itu berhenti, pengetahuan ikut menghilang. Mendokumentasikannya — dengan izin dan penghormatan kepada pemilik cerita — adalah salah satu cara merawatnya.

## Apa yang dicatat RASIBOGA
- Nama hidangan dan bahan yang digunakan.
- Proses pengolahan dan peralatan yang lazim dipakai.
- Keterkaitan hidangan dengan lokasi asal.
- Sumber informasi dan status verifikasinya.

## Catatan penting
Artikel ini adalah pengantar, bukan klaim sejarah. Setiap klaim budaya pada platform ini wajib mencantumkan sumber atau ditandai sebagai belum terverifikasi.`,
  },
  {
    title: 'Panduan Verifikasi Sumber',
    slug: 'panduan-verifikasi-sumber',
    excerpt:
      'Kerangka kerja sederhana untuk memastikan konten kuliner yang dipublikasikan dapat dipertanggungjawabkan.',
    category: 'Metodologi',
    coverImage: '/assets/articles/article-2.svg',
    content: `Setiap konten pada RASIBOGA melewati pemeriksaan sederhana sebelum ditandai terverifikasi.

## Tingkatan sumber
- **Sumber primer**: wawancara langsung dengan pelaku kuliner, dokumentasi UMKM, catatan pemerintah desa.
- **Sumber sekunder**: publikasi akademik, buku budaya, arsip daerah.
- **Belum bersumber**: konten yang masih berupa draf.

## Status konten
Konten draf tetap dapat ditampilkan, tetapi selalu diberi label "Draf" agar pembaca tidak salah menganggapnya sebagai fakta final.

## Koordinat
Koordinat hanya ditampilkan sebagai titik terverifikasi apabila telah diperiksa di lapangan. Titik contoh selalu ditandai "Belum terverifikasi".`,
  },
  {
    title: 'Peta Rasa Rembang: Catatan Awal',
    slug: 'peta-rasa-rembang-catatan-awal',
    excerpt:
      'Rencana pemetaan asal-usul makanan dan bahan pangan di Kabupaten Rembang.',
    category: 'Peta',
    coverImage: '/assets/articles/article-3.svg',
    content: `Peta gastronomi RASIBOGA menghubungkan hidangan dan bahan pangan dengan lokasi asalnya.

## Dua lapis peta
1. **Peta asal makanan** — menampilkan lokasi yang dikaitkan dengan sebuah hidangan.
2. **Peta asal bahan** — menampilkan lokasi yang dikaitkan dengan bahan pangan tertentu.

## Status saat ini
Data lokasi pada versi awal masih berupa contoh. Beberapa titik menggunakan pusat kecamatan sebagai acuan sementara dan belum diverifikasi.

## Langkah berikutnya
- Verifikasi koordinat desa bersama pemerintah desa.
- Pendataan UMKM dan produsen bahan.
- Dokumentasi foto dan wawancara dengan izin narasumber.`,
  },
];

export const videosSeed = [
  {
    title: 'Contoh: Dokumentasi proses memasak (belum tersedia)',
    description:
      'Slot contoh untuk video dokumentasi. Ganti URL melalui dashboard admin setelah video resmi tersedia.',
    type: 'youtube',
    category: 'Dokumentasi',
    url: '',
    embedUrl: '',
    thumbnail: '/assets/videos/video-placeholder.svg',
    featured: true,
    published: false,
  },
  {
    title: 'Contoh: Wawancara pelaku kuliner (belum tersedia)',
    description:
      'Slot contoh untuk wawancara. Pastikan izin narasumber diperoleh sebelum publikasi.',
    type: 'youtube',
    category: 'Wawancara',
    url: '',
    embedUrl: '',
    thumbnail: '/assets/videos/video-placeholder.svg',
    featured: false,
    published: false,
  },
  {
    title: 'Contoh: Animasi langkah resep (belum tersedia)',
    description: 'Slot contoh untuk animasi langkah memasak.',
    type: 'animation',
    category: 'Tutorial',
    url: '',
    embedUrl: '',
    thumbnail: '/assets/videos/video-placeholder.svg',
    featured: false,
    published: false,
  },
];

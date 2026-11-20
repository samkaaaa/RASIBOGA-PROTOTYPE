/**
 * Glosarium istilah kuliner Jawa / Rembang.
 * Disusun sebagai daftar istilah umum; definisi dapat disesuaikan editor.
 */
export const glossaryTerms = [
  { term: 'Ampas', category: 'Teknik', definition: 'Sisa padatan setelah cairan diperas atau disaring, misalnya ampas kelapa setelah diambil santannya.' },
  { term: 'Brambang', category: 'Bahan', definition: 'Sebutan Jawa untuk bawang merah.' },
  { term: 'Cemoi', category: 'Minuman', definition: 'Istilah lokal untuk minuman hangat berisi butiran tepung; penulisan dan resepnya dapat berbeda antar daerah.' },
  { term: 'Dangdang', category: 'Peralatan', definition: 'Wadah besar berbentuk dangkal untuk mengukus atau menanak, biasanya dari tanah liat atau logam.' },
  { term: 'Dumbeg', category: 'Nama makanan', definition: 'Sajian tradisional Rembang yang dikaitkan dengan Desa Pohlandak dan Kecamatan Pancur. Komposisi belum terverifikasi.' },
  { term: 'Godhog', category: 'Teknik', definition: 'Merebus; proses memasak bahan dalam air mendidih.' },
  { term: 'Goreng', category: 'Teknik', definition: 'Memasak bahan dalam minyak panas.' },
  { term: 'Iwak', category: 'Bahan', definition: 'Sebutan Jawa untuk ikan atau lauk hewani.' },
  { term: 'Jajanan', category: 'Kategori', definition: 'Makanan ringan atau camilan, biasanya dikonsumsi di antara waktu makan.' },
  { term: 'Jangan', category: 'Nama makanan', definition: 'Dalam bahasa Jawa berarti sayur atau masakan berkuah.' },
  { term: 'Kelo', category: 'Bahan', definition: 'Sebutan lokal untuk kerang.' },
  { term: 'Kemiri', category: 'Bahan', definition: 'Biji keras berlemak yang dipakai untuk mengentalkan dan memberi rasa gurih pada bumbu.' },
  { term: 'Kencur', category: 'Bahan', definition: 'Rimpang beraroma khas, sering dipakai pada jamu dan masakan tradisional.' },
  { term: 'Kukus', category: 'Teknik', definition: 'Memasak dengan uap air panas di dalam kukusan.' },
  { term: 'Kunyit', category: 'Bahan', definition: 'Rimpang kuning yang memberi warna dan aroma pada masakan.' },
  { term: 'Lombok', category: 'Bahan', definition: 'Sebutan Jawa untuk cabai.' },
  { term: 'Lontong', category: 'Nama makanan', definition: 'Beras yang dimasak dalam kemasan daun atau cetakan hingga padat, biasanya disajikan dengan kuah.' },
  { term: 'Mrico', category: 'Bahan', definition: 'Sebutan Jawa untuk merica; pada nama hidangan menandakan penggunaan merica sebagai bumbu utama.' },
  { term: 'Pasar', category: 'Tempat', definition: 'Tempat jual beli bahan pangan; sering menjadi simpul distribusi bahan lokal.' },
  { term: 'Sambal', category: 'Pelengkap', definition: 'Saus pedas berbahan cabai dan bumbu lain, disajikan sebagai pelengkap.' },
  { term: 'Santan', category: 'Bahan', definition: 'Cairan hasil perasan kelapa parut, memberi rasa gurih pada kuah.' },
  { term: 'Sego', category: 'Bahan', definition: 'Sebutan Jawa untuk nasi.' },
  { term: 'Tumis', category: 'Teknik', definition: 'Menumis bumbu dengan sedikit minyak hingga harum sebelum bahan utama dimasukkan.' },
  { term: 'Ungkep', category: 'Teknik', definition: 'Memasak bahan dengan bumbu dan sedikit cairan hingga bumbu meresap dan cairan menyusut.' },
  { term: 'Wedang', category: 'Minuman', definition: 'Minuman hangat berbahan rempah atau gula, lazim disajikan malam hari.' },
];

export const glossaryCategories = ['Semua', ...Array.from(new Set(glossaryTerms.map((item) => item.category)))];

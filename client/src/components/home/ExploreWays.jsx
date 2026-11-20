import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned, Sprout, UtensilsCrossed } from 'lucide-react';
import { mediaUrl } from '../../services/api.js';
import { formatNumber } from '../../utils/format.js';
import Reveal from '../common/Reveal.jsx';
import SectionHeading from '../common/SectionHeading.jsx';

export default function ExploreWays({ foods = [], ingredients = [], counts = {} }) {
  const categoryImage =
    mediaUrl(foods.find((food) => food.category === 'Makanan Berat')?.mainImage?.url) ||
    '/assets/foods/bakso-lempit.svg';
  const ingredientImage =
    mediaUrl(ingredients.find((ingredient) => ingredient.image?.url)?.image?.url) ||
    '/assets/foods/kelo-mrico.svg';

  const ways = [
    {
      title: 'Berdasarkan Jenis',
      description: 'Dari hidangan berat hingga jajanan dan minuman hangat.',
      count: counts.foods || 0,
      unit: 'entri makanan',
      to: '/jelajah',
      image: categoryImage,
      alt: 'Ilustrasi makanan tradisional Rembang',
      Icon: UtensilsCrossed,
      chip: 'Kategori',
    },
    {
      title: 'Wilayah / Kecamatan',
      description: 'Telusuri rasa menurut kecamatan dan titik asal di peta.',
      count: counts.districts || 0,
      unit: 'kecamatan',
      to: '/peta',
      image: '/assets/map-placeholder.svg',
      alt: 'Ilustrasi peta gastronomi Kabupaten Rembang',
      Icon: MapPinned,
      chip: 'Peta',
    },
    {
      title: 'Bahan',
      description: 'Kenali bahan asli daerah yang membentuk karakter rasa.',
      count: counts.ingredients || 0,
      unit: 'bahan terdata',
      to: '/glosarium',
      image: ingredientImage,
      alt: 'Ilustrasi bahan pangan lokal Rembang',
      Icon: Sprout,
      chip: 'Glosarium',
    },
  ];

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cara menjelajah"
          title="Tiga cara menjelajah rasa"
          description="Pilih pintu masuk yang paling nyaman: lewat jenis hidangan, wilayah asal, atau bahan yang menyusunnya."
          action={{ to: '/jelajah', label: 'Lihat semua' }}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ways.map((way, index) => (
            <Reveal key={way.title} delay={index * 0.08} className="h-full">
              <Link
                to={way.to}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_18px_50px_-38px_rgba(46,31,27,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_26px_60px_-34px_rgba(46,31,27,0.32)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep">
                  <img
                    src={way.image}
                    alt={way.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.src = '/assets/food-placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa/55 via-cocoa/5 to-transparent" />

                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-pink/70 bg-pink/95 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-cocoa">
                    <way.Icon size={12} />
                    {way.chip}
                  </span>

                  <span className="absolute bottom-4 left-4 inline-flex items-center rounded-full border border-cream-soft/50 bg-cream-soft/85 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-cocoa backdrop-blur-sm">
                    {formatNumber(way.count)} {way.unit}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-display text-2xl leading-[1.1] tracking-[-0.01em] text-cocoa transition-colors group-hover:text-brick">
                    {way.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cocoa-soft">{way.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-brick">
                    Mulai jelajah
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

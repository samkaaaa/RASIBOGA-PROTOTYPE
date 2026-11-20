import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Camera,
  FileText,
  MapPinned,
  Sprout,
  UtensilsCrossed,
} from 'lucide-react';
import { getData } from '../services/api.js';
import useAsync from '../hooks/useAsync.js';
import Reveal from '../components/common/Reveal.jsx';
import { formatNumber } from '../utils/format.js';
import HeroCarousel from '../components/home/HeroCarousel.jsx';
import StatsStrip from '../components/home/StatsStrip.jsx';
import ExploreWays from '../components/home/ExploreWays.jsx';
import FoodShowcase from '../components/home/FoodShowcase.jsx';
import RecipeRail from '../components/home/RecipeRail.jsx';
import OriginSection from '../components/home/OriginSection.jsx';
import MediaGallery from '../components/home/MediaGallery.jsx';
import StorySection from '../components/home/StorySection.jsx';
import IngredientMarquee from '../components/home/IngredientMarquee.jsx';
import ContributionCTA from '../components/home/ContributionCTA.jsx';

async function loadHome() {
  const [foods, ingredients, recipes, videos, articles, map, categories] = await Promise.all([
    getData('/foods', { params: { limit: 60, sort: 'featured' } }),
    getData('/ingredients', { params: { limit: 60 } }),
    getData('/recipes', { params: { limit: 60 } }),
    getData('/videos', { params: { limit: 12 } }),
    getData('/articles', { params: { limit: 12 } }),
    getData('/locations/map'),
    getData('/categories'),
  ]);

  return {
    foods: foods.data || [],
    foodsTotal: foods.meta?.total ?? foods.data?.length ?? 0,
    ingredients: ingredients.data || [],
    ingredientsTotal: ingredients.meta?.total ?? ingredients.data?.length ?? 0,
    recipes: recipes.data || [],
    recipesTotal: recipes.meta?.total ?? recipes.data?.length ?? 0,
    videos: videos.data || [],
    videosTotal: videos.meta?.total ?? videos.data?.length ?? 0,
    articles: articles.data || [],
    articlesTotal: articles.meta?.total ?? articles.data?.length ?? 0,
    map: map.data || null,
    categories: categories.data || [],
  };
}

function sortFeatured(foods = []) {
  return [...foods].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

export default function Home() {
  const { data, loading, error, reload } = useAsync(loadHome, []);

  const foods = useMemo(() => sortFeatured(data?.foods), [data]);
  const ingredients = data?.ingredients || [];
  const recipes = data?.recipes || [];
  const videos = data?.videos || [];
  const articles = data?.articles || [];
  const map = data?.map;

  const foodsTotal = data?.foodsTotal || 0;
  const ingredientsTotal = data?.ingredientsTotal || 0;
  const recipesTotal = data?.recipesTotal || 0;
  const districtCount = map?.districts?.length || 0;
  const carouselFoods = foods.slice(0, 6);

  const mediaCount = useMemo(() => {
    if (!data) return 0;

    const foodMedia = data.foods.reduce(
      (total, food) => total + (food.mainImage?.url ? 1 : 0) + (food.gallery?.length || 0),
      0
    );
    const ingredientMedia = data.ingredients.filter((ingredient) => ingredient.image?.url).length;
    const articleMedia = data.articles.filter((article) => article.coverImage).length;
    const recipeMedia = data.recipes.reduce(
      (total, recipe) =>
        total + (recipe.steps || []).filter((step) => step.media?.url).length,
      0
    );

    return foodMedia + ingredientMedia + articleMedia + recipeMedia + data.videos.length;
  }, [data]);

  const documentationCount =
    (map?.foodMarkers?.length || 0) +
    (map?.ingredientMarkers?.length || 0) +
    (data?.articlesTotal || 0);

  const stats = [
    { label: 'Makanan Tradisional', value: foodsTotal, icon: UtensilsCrossed },
    { label: 'Bahan Asli Daerah', value: ingredientsTotal, icon: Sprout },
    { label: 'Resep Terdokumentasi', value: recipesTotal, icon: BookOpen },
    { label: 'Foto & Video', value: mediaCount, icon: Camera },
    { label: 'Dokumentasi / Sumber', value: documentationCount, icon: FileText },
  ];

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFFAF5 0%, #FDEFE3 100%)' }}
      >
        <div className="container-page grid items-center gap-10 py-10 nav:min-h-[calc(100vh_-_72px)] nav:grid-cols-[1.1fr_0.9fr] nav:gap-10 nav:py-8 xl:gap-16">
          <div className="max-w-[620px]">
            <Reveal>
              <p className="eyebrow">Arsip Kuliner Digital · Rembang</p>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-5 max-w-xl font-display text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.01em] text-cocoa">
                Rasa yang tersimpan
                <span className="block text-brick">di tanah Rembang.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[540px] text-[1.05rem] leading-[1.65] text-cocoa-soft">
                Menjelajah makanan tradisional, resep, asal-usul bahan, dan cerita budaya Kabupaten
                Rembang — terdokumentasi, terhubung, dan dapat diakses siapa saja.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/jelajah" className="btn-primary group">
                  Jelajahi Rasa
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link to="/peta" className="btn-outline">
                  <MapPinned size={16} />
                  Peta Gastronomi
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 border-t border-line pt-6">
                {[
                  { label: 'Makanan', value: loading ? '—' : formatNumber(foodsTotal) },
                  { label: 'Resep', value: loading ? '—' : formatNumber(recipesTotal) },
                  { label: 'Kecamatan', value: loading ? '—' : formatNumber(districtCount) },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={index === 0 ? 'pr-4' : 'border-l border-line px-4 last:pr-0'}
                  >
                    <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-cocoa-soft">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 font-display text-[36px] font-semibold leading-none tracking-[-0.01em] text-cocoa">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="mx-auto w-full nav:max-w-none">
            <HeroCarousel foods={carouselFoods} loading={loading && !data} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- STATS */}
      <StatsStrip items={stats} />

      {/* ------------------------------------------------------- EXPLORE */}
      <ExploreWays
        foods={foods}
        ingredients={ingredients}
        counts={{
          foods: foodsTotal,
          districts: districtCount,
          ingredients: ingredientsTotal,
        }}
      />

      {/* -------------------------------------------------------- MAKANAN */}
      <FoodShowcase foods={foods} loading={loading} error={error} onRetry={reload} />

      {/* ---------------------------------------------------------- RESEP */}
      <RecipeRail recipes={recipes} loading={loading} />

      {/* ------------------------------------------------------------ PETA */}
      <OriginSection map={map} loading={loading} />

      {/* --------------------------------------------------------- GALERI */}
      <MediaGallery
        foods={foods}
        articles={articles}
        videos={videos}
        loading={loading}
      />

      {/* --------------------------------------------------------- CERITA */}
      <StorySection articles={articles} loading={loading} />

      {/* ---------------------------------------------------- BAHAN LOKAL */}
      <IngredientMarquee ingredients={ingredients} />

      {/* ---------------------------------------------------- KONTRIBUSI */}
      <ContributionCTA />
    </>
  );
}

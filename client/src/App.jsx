import { Route, Routes } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import IntroSplash from './components/layout/IntroSplash.jsx';

import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import FoodDetail from './pages/FoodDetail.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import CookingMode from './pages/CookingMode.jsx';
import GastronomyMap from './pages/GastronomyMap.jsx';
import Stories from './pages/Stories.jsx';
import StoryDetail from './pages/StoryDetail.jsx';
import Glossary from './pages/Glossary.jsx';
import IngredientDetail from './pages/IngredientDetail.jsx';
import Community from './pages/Community.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLogin from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminFoods from './pages/admin/Foods.jsx';
import AdminRecipes from './pages/admin/Recipes.jsx';
import AdminIngredients from './pages/admin/Ingredients.jsx';
import AdminLocations from './pages/admin/Locations.jsx';
import AdminVideos from './pages/admin/Videos.jsx';
import AdminArticles from './pages/admin/Articles.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminSubmissions from './pages/admin/Submissions.jsx';
import AdminSettings from './pages/admin/Settings.jsx';

export default function App() {
  return (
    <>
      <IntroSplash />
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="jelajah" element={<Explore />} />
          <Route path="makanan/:slug" element={<FoodDetail />} />
          <Route path="resep/:id" element={<RecipeDetail />} />
          <Route path="peta" element={<GastronomyMap />} />
          <Route path="cerita" element={<Stories />} />
          <Route path="cerita/:slug" element={<StoryDetail />} />
          <Route path="glosarium" element={<Glossary />} />
          <Route path="bahan/:slug" element={<IngredientDetail />} />
          <Route path="kontribusi" element={<Community />} />
          <Route path="simpanan" element={<Bookmarks />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Focused cooking experience (no site chrome) */}
        <Route path="resep/:id/memasak" element={<CookingMode />} />

        {/* Admin */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="makanan" element={<AdminFoods />} />
          <Route path="resep" element={<AdminRecipes />} />
          <Route path="bahan" element={<AdminIngredients />} />
          <Route path="lokasi" element={<AdminLocations />} />
          <Route path="video" element={<AdminVideos />} />
          <Route path="artikel" element={<AdminArticles />} />
          <Route path="kategori" element={<AdminCategories />} />
          <Route path="kontribusi" element={<AdminSubmissions />} />
          <Route path="pengaturan" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'rasiboga:bookmarks:v1';
const BookmarkContext = createContext(null);

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.slug) : [];
  } catch {
    return [];
  }
}

export function BookmarkProvider({ children }) {
  const [items, setItems] = useState(() => readStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be full / disabled; bookmarks stay in memory
    }
  }, [items]);

  const isSaved = useCallback((slug) => items.some((item) => item.slug === slug), [items]);

  const toggle = useCallback((food) => {
    if (!food?.slug) return;
    setItems((current) => {
      const exists = current.some((item) => item.slug === food.slug);
      if (exists) {
        toast.success(`"${food.name}" dihapus dari simpanan`);
        return current.filter((item) => item.slug !== food.slug);
      }
      toast.success(`"${food.name}" disimpan`);
      return [
        {
          slug: food.slug,
          name: food.name,
          category: food.category,
          image: food.mainImage?.url || food.image || '',
          provenance: food.provenance?.type || '',
          savedAt: new Date().toISOString(),
        },
        ...current,
      ];
    });
  }, []);

  const remove = useCallback((slug) => {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, isSaved, toggle, remove, clear }),
    [items, isSaved, toggle, remove, clear]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks harus dipakai di dalam BookmarkProvider');
  return context;
}

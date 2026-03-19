import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "office_map_image_url";

export function useOfficeMapImage() {
  const [imageUrl, setImageUrlState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setImageUrlState(saved && saved.length > 0 ? saved : null);
  }, []);

  const setImageUrl = useCallback((url: string | null) => {
    const v = url?.trim() ? url.trim() : null;
    if (v) localStorage.setItem(STORAGE_KEY, v);
    else localStorage.removeItem(STORAGE_KEY);
    setImageUrlState(v);
  }, []);

  const clearImageUrl = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setImageUrlState(null);
  }, []);

  return { imageUrl, setImageUrl, clearImageUrl };
}


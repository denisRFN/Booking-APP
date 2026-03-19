import { useCallback, useEffect, useState } from "react";

import { apiClient } from "../services/apiClient";

const STORAGE_KEY = "office_map_image_url";

export function useOfficeMapImage() {
  const [imageUrl, setImageUrlState] = useState<string | null>(null);

  useEffect(() => {
    // Prefer backend value (cloud), fallback to localStorage in case backend is not yet updated.
    const load = async () => {
      try {
        const { data } = await apiClient.get<{ office_map_image_url: string | null }>("/office-map-settings");
        const v = data.office_map_image_url ?? null;
        setImageUrlState(v && v.length > 0 ? v : null);
      } catch {
        const saved = localStorage.getItem(STORAGE_KEY);
        setImageUrlState(saved && saved.length > 0 ? saved : null);
      }
    };
    load();
  }, []);

  const setImageUrl = useCallback(async (url: string | null) => {
    const v = url?.trim() ? url.trim() : null;
    setImageUrlState(v);

    // Keep localStorage as a temporary fallback.
    try {
      if (v) localStorage.setItem(STORAGE_KEY, v);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    try {
      await apiClient.put("/office-map-settings", { office_map_image_url: v });
    } catch {
      // ignore: the UI will still show the optimistic value.
    }
  }, []);

  const clearImageUrl = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setImageUrlState(null);
  }, []);

  return { imageUrl, setImageUrl, clearImageUrl };
}


import { useCallback, useEffect, useMemo, useState } from "react";

type DeskRotationMap = Record<number, number>;

const STORAGE_KEY = "desk_rotations_deg_v1";

function normalizeRotation(deg: number): number {
  const r = ((Math.round(deg) % 360) + 360) % 360;
  return r;
}

export function useDeskRotations() {
  const [map, setMap] = useState<DeskRotationMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DeskRotationMap;
      if (parsed && typeof parsed === "object") {
        setMap(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((next: DeskRotationMap) => {
    setMap(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const getRotation = useCallback(
    (deskId: number) => normalizeRotation(map[deskId] ?? 0),
    [map]
  );

  const setRotation = useCallback(
    (deskId: number, deg: number) => {
      const r = normalizeRotation(deg);
      persist({ ...map, [deskId]: r });
    },
    [map, persist]
  );

  const rotateBy = useCallback(
    (deskId: number, deltaDeg: number) => {
      const next = normalizeRotation((map[deskId] ?? 0) + deltaDeg);
      persist({ ...map, [deskId]: next });
    },
    [map, persist]
  );

  const rotationStyleFor = useCallback(
    (deskId: number) => {
      const deg = getRotation(deskId);
      return { transform: `rotate(${deg}deg)` };
    },
    [getRotation]
  );

  const all = useMemo(() => map, [map]);

  return { all, getRotation, setRotation, rotateBy, rotationStyleFor };
}


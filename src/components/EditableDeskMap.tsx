import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../lib/utils";
import type { Desk } from "../types/api";

const DESK_W = 80;
const DESK_H = 40;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const GRID_STEP = 5; // 0-100 in steps of 5 => 20x20 grid

function snapToGrid(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function getCell(px: number, py: number, step: number): string {
  return `${Math.round(px / step)}_${Math.round(py / step)}`;
}

/** Find nearest free cell; usedCells is set of "x_y" strings */
function findNearestFreeCell(
  cx: number,
  cy: number,
  usedCells: Set<string>,
  step: number
): { x: number; y: number } {
  const key = getCell(cx, cy, step);
  if (!usedCells.has(key)) return { x: cx, y: cy };

  for (let r = 1; r <= 20; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = clamp(cx + dx * step, step, 100 - step);
        const ny = clamp(cy + dy * step, step, 100 - step);
        const k = getCell(nx, ny, step);
        if (!usedCells.has(k)) return { x: nx, y: ny };
      }
    }
  }
  return { x: cx, y: cy };
}

interface EditableDeskMapProps {
  desks: Desk[];
  snapToGrid: boolean;
  onPositionChange: (desk: Desk, position_x: number, position_y: number) => void;
  onDeskClick?: (desk: Desk) => void;
  selectedDeskId?: number | null;
}

export function EditableDeskMap({
  desks,
  snapToGrid: snapEnabled,
  onPositionChange,
  onDeskClick,
  selectedDeskId
}: EditableDeskMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 400, h: 250 });

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onResize = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const usedCells = useCallback(
    (excludingDeskId?: number) => {
      const set = new Set<string>();
      desks.forEach((d) => {
        if (d.id === excludingDeskId) return;
        const cx = snapEnabled ? snapToGrid(d.position_x, GRID_STEP) : d.position_x;
        const cy = snapEnabled ? snapToGrid(d.position_y, GRID_STEP) : d.position_y;
        set.add(getCell(cx, cy, GRID_STEP));
      });
      return set;
    },
    [desks, snapEnabled]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-glass backdrop-blur-xl ring-1 ring-white/[0.03]">
      <div className="office-map-surface relative w-full h-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary to-background">
        <div
          ref={mapRef}
          className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
        >
          {desks.map((desk) => {
            const w = size.w;
            const h = size.h;

            let cx = desk.position_x;
            let cy = desk.position_y;
            if (snapEnabled) {
              cx = snapToGrid(cx, GRID_STEP);
              cy = snapToGrid(cy, GRID_STEP);
            }
            cx = clamp(cx, 5, 95);
            cy = clamp(cy, 5, 95);

            const x = (cx / 100) * w - DESK_W / 2;
            const y = (cy / 100) * h - DESK_H / 2;

            return (
              <Rnd
                key={desk.id}
                size={{ width: DESK_W, height: DESK_H }}
                bounds="parent"
                position={{ x: clamp(x, 0, w - DESK_W), y: clamp(y, 0, h - DESK_H) }}
                onDragStop={(_, d) => {
                  const w2 = size.w;
                  const h2 = size.h;
                  let centerX = (d.x + DESK_W / 2) / w2;
                  let centerY = (d.y + DESK_H / 2) / h2;
                  let newX = Math.round(centerX * 100);
                  let newY = Math.round(centerY * 100);
                  if (snapEnabled) {
                    newX = snapToGrid(newX, GRID_STEP);
                    newY = snapToGrid(newY, GRID_STEP);
                    newX = clamp(newX, 5, 95);
                    newY = clamp(newY, 5, 95);
                    const cells = usedCells(desk.id);
                    const { x: fx, y: fy } = findNearestFreeCell(newX, newY, cells, GRID_STEP);
                    newX = fx;
                    newY = fy;
                  } else {
                    newX = Math.round(clamp(newX, 5, 95));
                    newY = Math.round(clamp(newY, 5, 95));
                  }
                  onPositionChange(desk, newX, newY);
                }}
                enableResizing={false}
                className={cn(
                  "flex items-center justify-center rounded-xl text-xs font-semibold shadow-lg shadow-black/40 cursor-grab active:cursor-grabbing transition-shadow duration-150",
                  "bg-primary/90 text-primary-foreground hover:shadow-glow",
                  selectedDeskId === desk.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeskClick?.(desk);
                }}
              >
                {desk.name}
              </Rnd>
            );
          })}
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md border border-white/[0.04]">
          Drag to reposition · Click desk to rename or delete
        </div>
      </div>
    </div>
  );
}

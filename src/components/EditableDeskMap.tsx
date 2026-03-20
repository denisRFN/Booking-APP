import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../lib/utils";
import type { Desk } from "../types/api";

const DESK_W = 120;
const DESK_H = 56;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const GRID_STEP = 2; // finer grid so desks can be closer together

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
  backgroundImageUrl?: string | null;
  getRotationDeg?: (deskId: number) => number;
}

export function EditableDeskMap({
  desks,
  snapToGrid: snapEnabled,
  onPositionChange,
  onDeskClick,
  selectedDeskId,
  backgroundImageUrl,
  getRotationDeg
}: EditableDeskMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 400, h: 250 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

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

  const zoomBy = (delta: number) => {
    setScale((s) => clamp(Number((s + delta).toFixed(2)), 0.6, 2.4));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-glass backdrop-blur-xl ring-1 ring-white/[0.03]">
      <div className="office-map-surface relative w-full h-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary to-background">
        <div
          ref={mapRef}
          className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
          onWheel={(e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            const dir = e.deltaY > 0 ? -1 : 1;
            zoomBy(dir * 0.12);
          }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            if (!e.altKey) return;
            setIsPanning(true);
            panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
          }}
          onMouseMove={(e) => {
            if (!isPanning) return;
            const start = panStartRef.current;
            if (!start) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            setPan({ x: start.panX + dx, y: start.panY + dy });
          }}
          onMouseUp={() => {
            setIsPanning(false);
            panStartRef.current = null;
          }}
          onMouseLeave={() => {
            setIsPanning(false);
            panStartRef.current = null;
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "50% 50%"
            }}
          >
            {backgroundImageUrl ? (
              <>
                <img
                  src={backgroundImageUrl}
                  alt="Office map"
                  className="absolute inset-0 h-full w-full object-contain object-center opacity-70"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35" />
              </>
            ) : null}
              {desks.map((desk) => {
            const w = size.w;
            const h = size.h;

            let cx = desk.position_x;
            let cy = desk.position_y;
            if (snapEnabled) {
              cx = snapToGrid(cx, GRID_STEP);
              cy = snapToGrid(cy, GRID_STEP);
            }
            cx = clamp(cx, 3, 97);
            cy = clamp(cy, 3, 97);

            const x = (cx / 100) * w - DESK_W / 2;
            const y = (cy / 100) * h - DESK_H / 2;

            const deg =
              typeof desk.rotation_deg === "number"
                ? desk.rotation_deg
                : getRotationDeg
                ? getRotationDeg(desk.id)
                : 0;

            return (
              <Rnd
                key={desk.id}
                size={{ width: DESK_W, height: DESK_H }}
                bounds="parent"
                position={{ x: clamp(x, 0, w - DESK_W), y: clamp(y, 0, h - DESK_H) }}
                scale={scale}
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
                    newX = clamp(newX, 3, 97);
                    newY = clamp(newY, 3, 97);
                    const cells = usedCells(desk.id);
                    const { x: fx, y: fy } = findNearestFreeCell(newX, newY, cells, GRID_STEP);
                    newX = fx;
                    newY = fy;
                  } else {
                    newX = Math.round(clamp(newX, 3, 97));
                    newY = Math.round(clamp(newY, 3, 97));
                  }
                  onPositionChange(desk, newX, newY);
                }}
                enableResizing={false}
                className={cn(
                  "flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing transition-shadow duration-150"
                )}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onDeskClick?.(desk);
                }}
              >
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-lg text-sm font-semibold shadow-md shadow-black/25",
                    "bg-primary/35 border border-primary/55 text-primary-foreground hover:bg-primary/45 hover:shadow-glow",
                    selectedDeskId === desk.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={deg ? { transform: `rotate(${deg}deg)` } : undefined}
                >
                  {desk.name}
                </div>
              </Rnd>
            );
          })}
          </div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md border border-white/[0.04]">
          <span>Drag desk · Click to edit · Hold <span className="text-foreground/85">Alt</span> to pan · <span className="text-foreground/85">Ctrl + Wheel</span> to zoom</span>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/90 px-1.5 py-1 shadow-subtle backdrop-blur-md border border-white/[0.04]">
          <button
            type="button"
            className="h-8 w-8 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            onClick={() => zoomBy(-0.12)}
            aria-label="Zoom out"
          >
            −
          </button>
          <div className="min-w-[56px] text-center text-[11px] text-muted-foreground tabular-nums">
            {Math.round(scale * 100)}%
          </div>
          <button
            type="button"
            className="h-8 w-8 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            onClick={() => zoomBy(0.12)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="ml-1 h-8 rounded-full px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
            onClick={resetView}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

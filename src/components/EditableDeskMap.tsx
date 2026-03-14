import { useRef } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../lib/utils";
import type { Desk } from "../types/api";

const DESK_W = 80;
const DESK_H = 40;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

interface EditableDeskMapProps {
  desks: Desk[];
  onPositionChange: (desk: Desk, position_x: number, position_y: number) => void;
}

export function EditableDeskMap({ desks, onPositionChange }: EditableDeskMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-glass backdrop-blur-xl ring-1 ring-white/[0.03]">
      <div className="office-map-surface relative w-full h-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary to-background">
        <div
          ref={mapRef}
          className="absolute inset-0 w-full h-full overflow-hidden rounded-xl"
        >
          {desks.map((desk) => {
            const rect = mapRef.current?.getBoundingClientRect();
            const w = rect?.width ?? 1;
            const h = rect?.height ?? 1;

            const x = clamp((desk.position_x / 100) * w - DESK_W / 2, 0, w - DESK_W);
            const y = clamp((desk.position_y / 100) * h - DESK_H / 2, 0, h - DESK_H);

            return (
              <Rnd
                key={desk.id}
                size={{ width: DESK_W, height: DESK_H }}
                bounds="parent"
                position={{ x, y }}
                onDragStop={(_, d) => {
                  const rect2 = mapRef.current?.getBoundingClientRect();
                  const w2 = rect2?.width ?? 1;
                  const h2 = rect2?.height ?? 1;
                  const centerX = (d.x + DESK_W / 2) / w2;
                  const centerY = (d.y + DESK_H / 2) / h2;
                  const newX = Math.round(clamp(centerX * 100, 0, 100));
                  const newY = Math.round(clamp(centerY * 100, 0, 100));
                  onPositionChange(desk, newX, newY);
                }}
                enableResizing={false}
                className={cn(
                  "flex items-center justify-center rounded-xl text-xs font-semibold shadow-lg shadow-black/40 cursor-grab active:cursor-grabbing transition-shadow duration-150",
                  "bg-primary/90 text-primary-foreground hover:shadow-glow"
                )}
              >
                {desk.name}
              </Rnd>
            );
          })}
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md border border-white/[0.04]">
          Drag desks to reposition
        </div>
      </div>
    </div>
  );
}

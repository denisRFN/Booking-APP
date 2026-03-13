import { useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { AvailabilityDesk } from "../types/api";

interface DeskMapProps {
  desks: AvailabilityDesk[];
  onSelectDesk: (desk: AvailabilityDesk) => void;
}

export function DeskMap({ desks, onSelectDesk }: DeskMapProps) {
  const maxX = useMemo(() => Math.max(1, ...desks.map((d) => d.position_x)), [desks]);
  const maxY = useMemo(() => Math.max(1, ...desks.map((d) => d.position_y)), [desks]);

  return (
    <div className="relative h-full min-h-[440px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-secondary/90 via-card/80 to-secondary/90 shadow-glass backdrop-blur-xl">
      <div className="relative w-full h-full rounded-xl border border-border bg-gradient-to-br from-secondary to-background overflow-hidden">
        {desks.map((desk) => {
          const left = 10 + (desk.position_x / maxX) * 80;
          const top = 10 + (desk.position_y / maxY) * 80;
          const colorClasses =
            desk.status === "available"
              ? "bg-primary/90 hover:bg-primary text-background"
              : desk.status === "mine"
              ? "bg-amber-400/90 hover:bg-amber-300/90 text-background"
              : "bg-rose-500/90 hover:bg-rose-400/90 text-background";

          return (
            <button
              key={desk.id}
              type="button"
              onClick={() => onSelectDesk(desk)}
              className={cn(
                "absolute flex h-9 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl text-xs font-semibold shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-[55%] hover:scale-[1.04]",
                colorClasses
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {desk.name}
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 flex gap-2 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md border border-white/[0.04]">
          <LegendDot className="bg-primary" label="Available" />
          <LegendDot className="bg-rose-400" label="Occupied" />
          <LegendDot className="bg-amber-300" label="My booking" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      <span>{label}</span>
    </span>
  );
}



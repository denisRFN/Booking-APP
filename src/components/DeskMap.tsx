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
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 shadow-glass backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.16),transparent_60%)]" />
      <div className="relative h-full w-full">
        {desks.map((desk) => {
          const left = (desk.position_x / maxX) * 100;
          const top = (desk.position_y / maxY) * 100;
          const colorClasses =
            desk.status === "available"
              ? "bg-emerald-500/90 hover:bg-emerald-400/90"
              : desk.status === "mine"
              ? "bg-amber-400/90 hover:bg-amber-300/90"
              : "bg-rose-500/90 hover:bg-rose-400/90";

          return (
            <button
              key={desk.id}
              type="button"
              onClick={() => onSelectDesk(desk)}
              className={cn(
                "absolute flex h-9 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl text-xs font-semibold text-slate-950 shadow-lg shadow-black/40 transition-transform hover:-translate-y-[55%] hover:scale-[1.04]",
                colorClasses
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {desk.name}
            </button>
          );
        })}
        <div className="absolute bottom-3 left-3 flex gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md">
          <LegendDot className="bg-emerald-400" label="Available" />
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


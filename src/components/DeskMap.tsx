import { useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { AvailabilityDesk } from "../types/api";

interface DeskMapProps {
  desks: AvailabilityDesk[];
  onSelectDesk: (desk: AvailabilityDesk) => void;
}

export function DeskMap({ desks, onSelectDesk }: DeskMapProps) {
  const clampPct = (v: number) => Math.max(8, Math.min(92, v));
  const fmtRange = (from?: string | null, to?: string | null) => {
    if (!from || !to) return null;
    const a = new Date(from);
    const b = new Date(to);
    return `${a.toLocaleString()} – ${b.toLocaleString()}`;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-glass backdrop-blur-xl ring-1 ring-white/[0.03]">
      <div className="office-map-surface relative w-full h-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary to-background">
        {desks.map((desk) => {
          // position_x / position_y are stored as center coordinates (0-100)
          const left = clampPct(desk.position_x);
          const top = clampPct(desk.position_y);
          const colorClasses =
            desk.status === "available"
              ? "bg-primary/90 hover:bg-primary text-background"
              : desk.status === "mine"
              ? "bg-amber-400/90 hover:bg-amber-300/90 text-background"
              : "bg-rose-500/90 hover:bg-rose-400/90 text-background";

          const bookedRange = fmtRange(desk.booked_from, desk.booked_to);
          const bookedBy =
            desk.booked_by_name && desk.booked_by_email
              ? `${desk.booked_by_name} (${desk.booked_by_email})`
              : desk.booked_by_name ?? desk.booked_by_email ?? null;

          return (
            <div
              key={desk.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <button
                type="button"
                onClick={() => onSelectDesk(desk)}
                className={cn(
                  "group relative flex h-9 w-16 items-center justify-center rounded-xl text-xs font-semibold shadow-lg shadow-black/40 transition-all duration-200 hover:-translate-y-[6%] hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  colorClasses
                )}
              >
                {desk.name}
                {(desk.status !== "available") && (bookedBy || bookedRange) && (
                  <div className="pointer-events-none absolute left-1/2 top-[-10px] z-20 w-[260px] -translate-x-1/2 -translate-y-full opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <div className="rounded-xl border border-white/[0.08] bg-card/95 px-3 py-2 text-left text-[11px] text-muted-foreground shadow-glass backdrop-blur-xl">
                      <div className="font-medium text-foreground">{desk.name} · {desk.room}</div>
                      {bookedBy && <div className="mt-0.5">Booked by: <span className="text-foreground/90">{bookedBy}</span></div>}
                      {bookedRange && <div className="mt-0.5">When: <span className="text-foreground/90">{bookedRange}</span></div>}
                      {!bookedBy && !bookedRange && <div className="mt-0.5">Reserved</div>}
                    </div>
                  </div>
                )}
              </button>
            </div>
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



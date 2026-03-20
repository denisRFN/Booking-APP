import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { AvailabilityDesk } from "../types/api";

interface DeskMapProps {
  desks: AvailabilityDesk[];
  onSelectDesk: (desk: AvailabilityDesk) => void;
  backgroundImageUrl?: string | null;
  getRotationDeg?: (deskId: number) => number;
}

export function DeskMap({ desks, onSelectDesk, backgroundImageUrl, getRotationDeg }: DeskMapProps) {
  const clampPct = (v: number) => Math.max(3, Math.min(97, v));
  const fmtRange = (from?: string | null, to?: string | null) => {
    if (!from || !to) return null;
    const a = new Date(from);
    const b = new Date(to);
    return `${a.toLocaleString()} – ${b.toLocaleString()}`;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-glass backdrop-blur-xl ring-1 ring-white/[0.03]">
      <div className="office-map-surface relative w-full h-full rounded-xl border border-border overflow-hidden bg-gradient-to-br from-secondary to-background">
        {backgroundImageUrl ? (
          <>
            <img
              src={backgroundImageUrl}
              alt="Office map"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35" />
          </>
        ) : null}
        {desks.map((desk) => {
          // position_x / position_y are stored as center coordinates (0-100)
          const left = clampPct(desk.position_x);
          const top = clampPct(desk.position_y);
          const colorClasses =
            desk.status === "available"
              ? "bg-primary/16 hover:bg-primary/22 border border-primary/30 text-primary-foreground shadow-[0_0_24px_-10px_rgba(251,191,36,0.25)]"
              : desk.status === "mine"
              ? "bg-primary/12 hover:bg-primary/18 border border-primary/25 text-primary-foreground shadow-[0_0_24px_-10px_rgba(251,191,36,0.18)]"
              : "bg-destructive/14 hover:bg-destructive/18 border border-destructive/30 text-primary-foreground shadow-[0_0_24px_-10px_rgba(244,63,94,0.18)]";

          const bookedRange = fmtRange(desk.booked_from, desk.booked_to);
          const bookedBy =
            desk.booked_by_name && desk.booked_by_email
              ? `${desk.booked_by_name} (${desk.booked_by_email})`
              : desk.booked_by_name ?? desk.booked_by_email ?? null;

          const tooltipTone =
            desk.status === "occupied"
              ? "border-destructive/25 bg-destructive/10"
              : desk.status === "mine"
              ? "border-primary/25 bg-primary/10"
              : "border-white/[0.08] bg-card/95";

          const deg =
            typeof desk.rotation_deg === "number"
              ? desk.rotation_deg
              : getRotationDeg
                ? getRotationDeg(desk.id)
                : 0;

          return (
            <div
              key={desk.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {/* Rotate wrapper (not the button) so Tailwind hover translate/scale still work on the desk chip */}
              <div
                className="flex items-center justify-center"
                style={{ transform: deg ? `rotate(${deg}deg)` : undefined }}
              >
                <button
                  type="button"
                  onClick={() => onSelectDesk(desk)}
                  className={cn(
                    "group relative flex h-12 min-w-[6.5rem] px-3 items-center justify-center rounded-lg text-sm font-semibold shadow-md shadow-black/25 transition-all duration-200 hover:-translate-y-[6%] hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    colorClasses
                  )}
                >
                  {desk.name}
                {(desk.status !== "available") && (bookedBy || bookedRange) && (
                  <div className="pointer-events-none absolute left-1/2 top-[-10px] z-20 w-[260px] -translate-x-1/2 -translate-y-full opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <div className={`rounded-xl border ${tooltipTone} px-3 py-2 text-left text-[11px] text-muted-foreground shadow-glass backdrop-blur-xl`}>
                      <div className="font-medium text-foreground">
                        {desk.status === "occupied" ? "Occupied" : desk.status === "mine" ? "My booking" : "Reserved"} · {desk.name} · {desk.room}
                      </div>

                      {desk.status === "occupied" && bookedBy && (
                        <div className="mt-0.5 text-destructive/90">
                          Occupied by: <span className="text-destructive/95">{bookedBy}</span>
                        </div>
                      )}

                      {desk.status === "mine" && bookedBy && (
                        <div className="mt-0.5 text-primary/90">
                          Booked by you: <span className="text-primary/95">{bookedBy}</span>
                        </div>
                      )}

                      {bookedRange && (
                        <div className="mt-0.5">
                          From–to: <span className="text-foreground/90">{bookedRange}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-3 left-3 flex gap-2 rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-subtle backdrop-blur-md border border-white/[0.04]">
          <LegendDot className="bg-primary/60" label="Available" />
          <LegendDot className="bg-destructive/60" label="Occupied" />
          <LegendDot className="bg-primary/55" label="My booking" />
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



import { useMemo } from "react";
import { View } from "react-big-calendar";
import { addDays, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";

import { ReservationEvent } from "../types/api";

interface CalendarViewProps {
  events: ReservationEvent[];
  defaultDate: Date;
  onNavigate?: (date: Date) => void;
  onViewChange?: (view: View) => void;
}

export function CalendarView({ events, defaultDate, onNavigate, onViewChange }: CalendarViewProps) {
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(defaultDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(defaultDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [defaultDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ReservationEvent[]>();
    weekDays.forEach((d) => map.set(format(d, "yyyy-MM-dd"), []));
    events.forEach((e) => {
      const d = new Date(e.start);
      const key = format(d, "yyyy-MM-dd");
      if (map.has(key)) {
        map.set(key, [...(map.get(key) ?? []), e]);
      }
    });
    return map;
  }, [events, weekDays]);

  return (
    <div className="calendar-theme h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-subtle backdrop-blur-sm border border-white/[0.06] flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-foreground/90 hover:bg-white/[0.06]"
            onClick={() => onNavigate?.(addDays(defaultDate, -1))}
          >
            Back
          </button>
          <button
            type="button"
            className="rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] text-primary-foreground hover:bg-primary/20"
            onClick={() => onNavigate?.(new Date())}
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-foreground/90 hover:bg-white/[0.06]"
            onClick={() => onNavigate?.(addDays(defaultDate, 1))}
          >
            Next
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground">Days only</div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 gap-2 p-2">
        {weekDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const isSelected = isSameDay(day, defaultDate);
          const primary = dayEvents[0];
          const hasBooking = !!primary;

          return (
            <button
              key={key}
              type="button"
              className={`rounded-xl border p-2 text-left transition-all ${
                isSelected
                  ? "border-primary/60 bg-primary/15 shadow-[0_0_0_1px_rgba(251,191,36,0.28)]"
                  : "border-white/[0.08] bg-black/10 hover:border-white/[0.16] hover:bg-white/[0.02]"
              }`}
              onClick={() => onNavigate?.(day)}
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div className="text-[22px] font-semibold leading-tight text-foreground">{format(day, "d")}</div>

              {!hasBooking && (
                <div className="mt-2 inline-flex rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 text-[10px] text-muted-foreground">
                  No desk
                </div>
              )}

              {hasBooking && (
                <div className="mt-2 rounded-md border border-primary/35 bg-primary/15 px-2 py-1">
                  <div className="truncate text-[11px] font-semibold text-primary-foreground">
                    {primary.deskName}
                  </div>
                  <div className="text-[10px] text-foreground/75">
                    {format(new Date(primary.start), "H:mm")} - {format(new Date(primary.end), "H:mm")}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


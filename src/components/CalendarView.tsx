import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { ReservationEvent } from "../types/api";

const locales = {
  "en-US": enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales
});

interface CalendarViewProps {
  events: ReservationEvent[];
  defaultDate: Date;
  onNavigate?: (date: Date) => void;
  onViewChange?: (view: View) => void;
}

export function CalendarView({ events, defaultDate, onNavigate, onViewChange }: CalendarViewProps) {
  const rbcEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        title: `${e.deskName} · ${e.room}`
      })),
    [events]
  );

  return (
    <div className="calendar-theme h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/95 via-card/90 to-secondary/95 shadow-subtle backdrop-blur-sm border border-white/[0.06] flex flex-col">
      {/* Custom toolbar: reduces confusion and guarantees day-by-day navigation */}
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
        <div className="text-[11px] text-muted-foreground">
          Day view
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Calendar
          localizer={localizer}
          events={rbcEvents}
          defaultView="day"
          views={["day"]}
          date={defaultDate}
          onView={onViewChange}
          style={{ height: "100%" }}
          toolbar={false}
          popup
        />
      </div>
    </div>
  );
}


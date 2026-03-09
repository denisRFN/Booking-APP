import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-subtle backdrop-blur-xl">
      <Calendar
        localizer={localizer}
        events={rbcEvents}
        defaultView="week"
        views={["day", "week"]}
        defaultDate={defaultDate}
        onNavigate={onNavigate}
        onView={onViewChange}
        style={{ height: 420 }}
        toolbar
        popup
      />
    </div>
  );
}


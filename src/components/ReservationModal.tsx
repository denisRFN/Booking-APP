import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { AvailabilityDesk } from "../types/api";
import { apiClient } from "../services/apiClient";
import { cn } from "../lib/utils";

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  desk: AvailabilityDesk | null;
  defaultDate: Date;
  onCreated: () => void;
}

export function ReservationModal({ open, onOpenChange, desk, defaultDate, onCreated }: ReservationModalProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [weekLoading, setWeekLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekDeskMap, setWeekDeskMap] = useState<Record<string, AvailabilityDesk | null>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [focusedDay, setFocusedDay] = useState<string>("");
  const deskId = desk?.id ?? null;
  const deskName = desk?.name ?? "";
  const deskRoom = desk?.room ?? "";

  const weekDays = useMemo(() => {
    const start = startOfWeek(defaultDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [defaultDate]);

  const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

  useEffect(() => {
    if (!open || !deskId) return;

    const loadWeekAvailability = async () => {
      setWeekLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          weekDays.map(async (d) => {
            const key = dayKey(d);
            const { data } = await apiClient.get<AvailabilityDesk[]>("/availability", {
              params: { date: key }
            });
            const deskForDay = data.find((item) => item.id === deskId) ?? null;
            return [key, deskForDay] as const;
          })
        );
        const map = Object.fromEntries(results) as Record<string, AvailabilityDesk | null>;
        setWeekDeskMap(map);
        const defaultKey = dayKey(defaultDate);
        const defaultDesk = map[defaultKey];
        const initialSelectable =
          defaultDesk && defaultDesk.status === "available"
            ? [defaultKey]
            : Object.entries(map)
                .filter(([, value]) => value?.status === "available")
                .map(([key]) => key)
                .slice(0, 1);
        setSelectedDays(initialSelectable);
        setFocusedDay(defaultKey);
      } catch {
        setError("Could not load weekly availability for this desk.");
      } finally {
        setWeekLoading(false);
      }
    };

    loadWeekAvailability();
  }, [open, deskId, defaultDate, weekDays]);

  const focusedDeskStatus = focusedDay ? weekDeskMap[focusedDay] : null;
  const focusedBookedBy =
    focusedDeskStatus?.booked_by_name && focusedDeskStatus?.booked_by_email
      ? `${focusedDeskStatus.booked_by_name} (${focusedDeskStatus.booked_by_email})`
      : focusedDeskStatus?.booked_by_name ?? focusedDeskStatus?.booked_by_email ?? null;

  const toggleDay = (key: string) => {
    const status = weekDeskMap[key]?.status;
    if (status !== "available") return;
    setSelectedDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
    setFocusedDay(key);
  };

  const fromDayKey = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (selectedDays.length === 0) {
        setError("Select at least one available day from current week.");
        setLoading(false);
        return;
      }

      if (eh < sh || (eh === sh && em <= sm)) {
        setError("End time must be after start time.");
        setLoading(false);
        return;
      }

      // Safety re-check right before booking to prevent race conditions.
      const freshChecks = await Promise.all(
        selectedDays.map(async (key) => {
          const { data } = await apiClient.get<AvailabilityDesk[]>("/availability", {
            params: { date: key }
          });
          const freshDesk = data.find((item) => item.id === deskId) ?? null;
          return { key, freshDesk };
        })
      );

      const unavailableNow = freshChecks.filter((item) => item.freshDesk?.status !== "available");
      if (unavailableNow.length > 0) {
        const refreshedMap = Object.fromEntries(freshChecks.map((item) => [item.key, item.freshDesk])) as Record<
          string,
          AvailabilityDesk | null
        >;
        setWeekDeskMap(refreshedMap);
        setSelectedDays((prev) => prev.filter((key) => refreshedMap[key]?.status === "available"));
        setFocusedDay(unavailableNow[0].key);
        setError("Booking blocked: one or more selected days were just taken. Please review and try again.");
        setLoading(false);
        return;
      }

      await Promise.all(
        selectedDays.map(async (key) => {
          const start = fromDayKey(key);
          start.setHours(sh, sm, 0, 0);
          const end = fromDayKey(key);
          end.setHours(eh, em, 0, 0);

          await apiClient.post("/reservations", {
            desk_id: deskId,
            start_time: start.toISOString(),
            end_time: end.toISOString()
          });
        })
      );
      onCreated();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError("Could not create reservation(s). One or more selected days may already be booked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display font-bold">Reserve {deskName}</DialogTitle>
          <DialogDescription>
            Current week · Room {deskRoom}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Choose day(s) this week</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {weekDays.map((d) => {
                const key = dayKey(d);
                const dayDesk = weekDeskMap[key];
                const status = dayDesk?.status ?? "occupied";
                const isSelectable = status === "available";
                const isSelected = selectedDays.includes(key);
                const statusLabel =
                  status === "available" ? "Available" : status === "mine" ? "Booked by you" : "Unavailable";
                const occupiedBy =
                  status === "occupied"
                    ? dayDesk?.booked_by_name ?? dayDesk?.booked_by_email ?? "another user"
                    : null;

                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left transition-colors",
                      isSelectable
                        ? "border-primary/35 bg-primary/10 hover:bg-primary/18"
                        : "border-destructive/30 bg-destructive/10 text-muted-foreground",
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      focusedDay === key && "border-white/20"
                    )}
                    onClick={() => toggleDay(key)}
                    disabled={!isSelectable || weekLoading}
                  >
                    <div className="text-xs font-semibold">{format(d, "EEE")}</div>
                    <div className="text-[11px] text-muted-foreground">{format(d, "dd MMM")}</div>
                    <div className="mt-1 text-[11px]">{statusLabel}</div>
                    {occupiedBy && (
                      <div className="mt-0.5 truncate text-[10px] text-destructive/90">Occupied by: {occupiedBy}</div>
                    )}
                  </button>
                );
              })}
            </div>
            {focusedDeskStatus?.status !== "available" && focusedDeskStatus && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs">
                <div className="font-medium text-destructive">
                  {focusedDeskStatus.status === "mine" ? "Booked by you" : "Unavailable"}
                </div>
                {focusedDeskStatus.status === "occupied" && (
                  <div className="text-muted-foreground">
                    Occupied by:{" "}
                    <span className="text-foreground">{focusedBookedBy ?? "another user"}</span>
                  </div>
                )}
                {focusedDeskStatus.status === "mine" && focusedBookedBy && (
                  <div className="text-muted-foreground">
                    Reserved by: <span className="text-foreground">{focusedBookedBy}</span>
                  </div>
                )}
                {focusedDeskStatus.booked_from && focusedDeskStatus.booked_to && (
                  <div className="text-muted-foreground">
                    Interval: {new Date(focusedDeskStatus.booked_from).toLocaleString()} -{" "}
                    {new Date(focusedDeskStatus.booked_to).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || weekLoading || selectedDays.length === 0 || !deskId}>
              {loading ? "Booking..." : `Confirm reservation${selectedDays.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


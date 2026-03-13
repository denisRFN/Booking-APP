import { useState } from "react";
import { addHours } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { AvailabilityDesk } from "../types/api";
import { apiClient } from "../services/apiClient";

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
  const [error, setError] = useState<string | null>(null);

  if (!desk) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const start = new Date(defaultDate);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(defaultDate);
      end.setHours(eh, em, 0, 0);

      if (end <= start) {
        setError("End time must be after start time.");
        setLoading(false);
        return;
      }

      await apiClient.post("/reservations", {
        desk_id: desk.id,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      });
      onCreated();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError("Could not create reservation. This desk might already be booked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display font-bold">Reserve {desk.name}</DialogTitle>
          <DialogDescription>
            {defaultDate.toLocaleDateString()} · Room {desk.room}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Confirm reservation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


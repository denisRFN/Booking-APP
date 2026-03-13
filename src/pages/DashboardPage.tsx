import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { AvailabilityDesk, Reservation } from "../types/api";
import { DeskMap } from "../components/DeskMap";
import { ReservationModal } from "../components/ReservationModal";
import { CalendarView } from "../components/CalendarView";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDesk, setSelectedDesk] = useState<AvailabilityDesk | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const availabilityQuery = useQuery({
    queryKey: ["availability", selectedDate.toDateString()],
    queryFn: async () => {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const { data } = await apiClient.get<AvailabilityDesk[]>(`/availability`, {
        params: { date: dateStr }
      });
      return data;
    }
  });

  const reservationsQuery = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Reservation[]>("/reservations", {
        params: { mine: true }
      });
      return data;
    }
  });

  const handleDeskClick = (desk: AvailabilityDesk) => {
    setSelectedDesk(desk);
    setModalOpen(true);
  };

  const events =
    reservationsQuery.data?.map((r) => ({
      id: r.id,
      start: r.start_time,
      end: r.end_time,
      deskName: r.desk_name,
      room: r.room
    })) ?? [];

  return (
    <MainLayout>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Office map</CardTitle>
                <CardDescription>Select a desk to reserve.</CardDescription>
              </div>
              <div className="flex gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                >
                  Previous day
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  Next day
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[520px]">
              {availabilityQuery.isLoading && <p className="text-sm text-muted-foreground">Loading desks...</p>}
              {availabilityQuery.data && (
                <DeskMap desks={availabilityQuery.data} onSelectDesk={handleDeskClick} />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Your upcoming reservations.</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarView
                events={events}
                defaultDate={selectedDate}
                onNavigate={(d) => setSelectedDate(d)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <ReservationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        desk={selectedDesk}
        defaultDate={selectedDate}
        onCreated={() => {
          availabilityQuery.refetch();
          reservationsQuery.refetch();
        }}
      />
    </MainLayout>
  );
}



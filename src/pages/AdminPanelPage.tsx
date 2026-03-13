import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Rnd } from "react-rnd";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { AvailabilityDesk, Reservation } from "../types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface Desk {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  room: string;
}

export default function AdminPanelPage() {
  const queryClient = useQueryClient();
  const [newDeskName, setNewDeskName] = useState("");
  const [newDeskRoom, setNewDeskRoom] = useState("Open space");

  const desksQuery = useQuery({
    queryKey: ["desks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Desk[]>("/desks");
      return data;
    }
  });

  const reservationsQuery = useQuery({
    queryKey: ["reservations-admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<Reservation[]>("/reservations", {
        params: { mine: false }
      });
      return data;
    }
  });

  const createDeskMutation = useMutation({
    mutationFn: async () => {
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      await apiClient.post("/desks", {
        name: newDeskName || "New desk",
        room: newDeskRoom || "Open space",
        position_x: Math.round(x),
        position_y: Math.round(y)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      setNewDeskName("");
    }
  });

  const deleteDeskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/desks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
    }
  });

  const updateDeskPositionMutation = useMutation({
    mutationFn: async (desk: Desk) => {
      await apiClient.put(`/desks/${desk.id}`, {
        position_x: desk.position_x,
        position_y: desk.position_y
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
    }
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
    }
  });

  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]">
        <Card className="opacity-0 animate-stagger-1">
          <CardHeader>
            <CardTitle className="font-display font-bold">Desk layout (admin)</CardTitle>
            <CardDescription>Drag desks to reposition them on the map.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-3">
              <div className="space-y-1">
                <Label htmlFor="desk-name">Desk name</Label>
                <Input
                  id="desk-name"
                  value={newDeskName}
                  onChange={(e) => setNewDeskName(e.target.value)}
                  placeholder="e.g. D-12"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="desk-room">Room</Label>
                <Input
                  id="desk-room"
                  value={newDeskRoom}
                  onChange={(e) => setNewDeskRoom(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={() => createDeskMutation.mutate()}>
                  Add desk
                </Button>
              </div>
            </div>
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-secondary/90 shadow-glass backdrop-blur-xl">
              {desksQuery.data?.map((desk) => {
                return (
                  <Rnd
                    key={desk.id}
                    size={{ width: 80, height: 40 }}
                    bounds="parent"
                    default={{
                      x: (desk.position_x / 100) * 600,
                      y: (desk.position_y / 100) * 360,
                      width: 80,
                      height: 40
                    }}
                    onDragStop={(_, d) => {
                      const parentWidth = 600;
                      const parentHeight = 360;
                      const newX = Math.round((d.x / parentWidth) * 100);
                      const newY = Math.round((d.y / parentHeight) * 100);
                      updateDeskPositionMutation.mutate({ ...desk, position_x: newX, position_y: newY });
                    }}
                    enableResizing={false}
                    className="flex items-center justify-center rounded-xl bg-primary/90 text-xs font-semibold text-primary-foreground shadow-lg shadow-black/40"
                  >
                    {desk.name}
                  </Rnd>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-stagger-2">
          <CardHeader>
            <CardTitle className="font-display font-bold">All reservations</CardTitle>
            <CardDescription>View and manage all users&apos; bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {reservationsQuery.data?.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-secondary/80 px-4 py-3 shadow-subtle"
                >
                  <div>
                    <div className="font-medium">
                      {r.desk_name} · {r.room}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.start_time).toLocaleString()} – {new Date(r.end_time).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelReservationMutation.mutate(r.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
              {!reservationsQuery.data?.length && (
                <p className="text-sm text-muted-foreground">No reservations.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Rnd } from "react-rnd";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { Reservation } from "../types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

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
  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const mapRef = useRef<HTMLDivElement | null>(null);

  const DESK_W = 80;
  const DESK_H = 40;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  const desksQuery = useQuery({
    queryKey: ["desks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Desk[]>("/desks");
      return data;
    }
  });

  const selectedDesk = useMemo(
    () => desksQuery.data?.find((d) => d.id === selectedDeskId) ?? null,
    [desksQuery.data, selectedDeskId]
  );

  useEffect(() => {
    if (!selectedDesk) return;
    setEditName(selectedDesk.name);
    setEditRoom(selectedDesk.room);
  }, [selectedDesk?.id]);

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
      setSelectedDeskId(null);
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

  const updateDeskDetailsMutation = useMutation({
    mutationFn: async (desk: Desk) => {
      await apiClient.put(`/desks/${desk.id}`, {
        name: desk.name,
        room: desk.room
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
            <div
              ref={mapRef}
              className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-secondary/90 shadow-glass backdrop-blur-xl"
            >
              {desksQuery.data?.map((desk) => {
                const rect = mapRef.current?.getBoundingClientRect();
                const w = rect?.width ?? 1;
                const h = rect?.height ?? 1;

                // position_x/position_y are stored as center coordinates (0-100)
                const x = clamp((desk.position_x / 100) * w - DESK_W / 2, 0, w - DESK_W);
                const y = clamp((desk.position_y / 100) * h - DESK_H / 2, 0, h - DESK_H);

                const active = desk.id === selectedDeskId;

                return (
                  <Rnd
                    key={desk.id}
                    size={{ width: DESK_W, height: DESK_H }}
                    bounds="parent"
                    position={{ x, y }}
                    onDragStart={() => setSelectedDeskId(desk.id)}
                    onDragStop={(_, d) => {
                      const rect2 = mapRef.current?.getBoundingClientRect();
                      const w2 = rect2?.width ?? 1;
                      const h2 = rect2?.height ?? 1;
                      const centerX = (d.x + DESK_W / 2) / w2;
                      const centerY = (d.y + DESK_H / 2) / h2;
                      const newX = Math.round(clamp(centerX * 100, 0, 100));
                      const newY = Math.round(clamp(centerY * 100, 0, 100));
                      updateDeskPositionMutation.mutate({ ...desk, position_x: newX, position_y: newY });
                    }}
                    enableResizing={false}
                    className={cn(
                      "flex items-center justify-center rounded-xl text-xs font-semibold shadow-lg shadow-black/40 cursor-grab active:cursor-grabbing transition-[transform,box-shadow] duration-150",
                      active
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                        : "bg-primary/90 text-primary-foreground hover:shadow-glow"
                    )}
                    onClick={() => setSelectedDeskId(desk.id)}
                  >
                    {desk.name}
                  </Rnd>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.06] bg-secondary/70 p-4 shadow-subtle md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground/90">Selected desk</div>
                {!selectedDesk && <div className="text-xs text-muted-foreground">Click a desk on the map.</div>}
                {selectedDesk && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-room">Room</Label>
                      <Input id="edit-room" value={editRoom} onChange={(e) => setEditRoom(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!selectedDesk || updateDeskDetailsMutation.isPending}
                  onClick={() => {
                    if (!selectedDesk) return;
                    updateDeskDetailsMutation.mutate({ ...selectedDesk, name: editName, room: editRoom });
                  }}
                >
                  {updateDeskDetailsMutation.isPending ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedDesk || deleteDeskMutation.isPending}
                  onClick={() => {
                    if (!selectedDesk) return;
                    deleteDeskMutation.mutate(selectedDesk.id);
                  }}
                >
                  {deleteDeskMutation.isPending ? "Deleting…" : "Delete"}
                </Button>
              </div>
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
                    {r.user_name && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Booked by <span className="text-foreground/85">{r.user_name}</span>
                        {r.user_email ? <span className="text-muted-foreground"> · {r.user_email}</span> : null}
                      </div>
                    )}
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


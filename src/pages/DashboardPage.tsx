import { useMemo, useState } from "react";
import { addDays, startOfWeek, endOfWeek, format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { AvailabilityDesk, Desk, Reservation } from "../types/api";
import { useAuth } from "../hooks/useAuth";
import { useOfficeMapImage } from "../hooks/useOfficeMapImage";
import { useDeskRotations } from "../hooks/useDeskRotations";
import { DeskMap } from "../components/DeskMap";
import { EditableDeskMap } from "../components/EditableDeskMap";
import { DeskEditorDialog } from "../components/DeskEditorDialog";
import { ReservationModal } from "../components/ReservationModal";
import { CalendarView } from "../components/CalendarView";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { OfficeMapSettingsDialog } from "../components/OfficeMapSettingsDialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const { imageUrl: officeMapImageUrl, setImageUrl: setOfficeMapImageUrl } = useOfficeMapImage();
  const { getRotation, setRotation } = useDeskRotations();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDesk, setSelectedDesk] = useState<AvailabilityDesk | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [deskEditorOpen, setDeskEditorOpen] = useState(false);
  const [mapSettingsOpen, setMapSettingsOpen] = useState(false);
  const [draftDesks, setDraftDesks] = useState<Desk[] | null>(null);

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

  const desksQuery = useQuery({
    queryKey: ["desks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Desk[]>("/desks");
      return data;
    },
    enabled: isAdmin && editMode
  });

  const hasLayoutChanges = useMemo(() => {
    if (!draftDesks || !desksQuery.data) return false;
    if (draftDesks.length !== desksQuery.data.length) return true;
    const byId = new Map(draftDesks.map((d) => [d.id, d]));
    return desksQuery.data.some((d) => {
      const draft = byId.get(d.id);
      return !draft || draft.position_x !== d.position_x || draft.position_y !== d.position_y || draft.name !== d.name || draft.room !== d.room;
    });
  }, [draftDesks, desksQuery.data]);

  const updateDeskPositionMutation = useMutation({
    mutationFn: async (desk: Desk & { position_x: number; position_y: number; rotation_deg?: number }) => {
      const payload: { position_x: number; position_y: number; rotation_deg?: number } = {
        position_x: desk.position_x,
        position_y: desk.position_y
      };
      if (typeof desk.rotation_deg !== "undefined") {
        payload.rotation_deg = desk.rotation_deg;
      }
      await apiClient.put(`/desks/${desk.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const updateDeskRotationMutation = useMutation({
    mutationFn: async ({ deskId, rotation_deg }: { deskId: number; rotation_deg: number }) => {
      // Admin-only mutation via JWT interceptor.
      await apiClient.put(`/desks/${deskId}`, { rotation_deg });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const updateDeskDetailsMutation = useMutation({
    mutationFn: async ({ desk, name, room }: { desk: Desk; name: string; room: string }) => {
      await apiClient.put(`/desks/${desk.id}`, { name, room });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const createDeskMutation = useMutation({
    mutationFn: async () => {
      const x = 15 + Math.floor(Math.random() * 70);
      const y = 15 + Math.floor(Math.random() * 70);
      const { data } = await apiClient.post<Desk>("/desks", {
        name: "New desk",
        position_x: x,
        position_y: y,
        room: "Open space"
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setEditingDesk(data);
      setDeskEditorOpen(true);
    }
  });

  const deleteDeskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/desks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["desks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setEditingDesk(null);
      setDeskEditorOpen(false);
    }
  });

  const handlePositionChange = (desk: Desk, position_x: number, position_y: number) => {
    setDraftDesks((prev) => {
      const base = prev ?? desksQuery.data ?? [];
      return base.map((d) => (d.id === desk.id ? { ...d, position_x, position_y } : d));
    });
  };

  const handleDeskClickEdit = (desk: Desk) => {
    setEditingDesk(desk);
    setDeskEditorOpen(true);
  };

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

  const freeDesks = availabilityQuery.data?.filter((d) => d.status === "available") ?? [];

  const currentDesksForEditor = draftDesks ?? desksQuery.data ?? [];

  const weekRangeLabel = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = format(start, "dd MMM");
    const endLabel = format(end, sameMonth ? "dd" : "dd MMM");
    return `${startLabel} – ${endLabel}`;
  }, [selectedDate]);

  const backendSupportsDeskRotation = useMemo(() => {
    const first = desksQuery.data?.[0] as (Desk & { rotation_deg?: number }) | undefined;
    return typeof first?.rotation_deg !== "undefined";
  }, [desksQuery.data]);

  const rotationByIdAvailability = useMemo(() => {
    const m = new Map<number, number>();
    (availabilityQuery.data ?? []).forEach((d) => {
      if (typeof d.rotation_deg === "number") m.set(d.id, d.rotation_deg);
    });
    return m;
  }, [availabilityQuery.data]);

  const rotationByIdEditor = useMemo(() => {
    const m = new Map<number, number>();
    (desksQuery.data ?? []).forEach((d) => {
      if (typeof d.rotation_deg === "number") m.set(d.id, d.rotation_deg);
    });
    return m;
  }, [desksQuery.data]);

  const getRotationDegAvailability = (deskId: number) =>
    rotationByIdAvailability.get(deskId) ?? getRotation(deskId);

  const getRotationDegEditor = (deskId: number) =>
    rotationByIdEditor.get(deskId) ?? getRotation(deskId);

  const handleEnterEditMode = () => {
    setEditMode(true);
    if (desksQuery.data) {
      setDraftDesks(desksQuery.data);
    }
  };

  const handleExitEditMode = () => {
    setEditMode(false);
    setDraftDesks(null);
  };

  const handleSaveLayout = () => {
    if (!draftDesks || !desksQuery.data) return;
    const originalById = new Map(desksQuery.data.map((d) => [d.id, d]));
    draftDesks.forEach((desk) => {
      const orig = originalById.get(desk.id);
      if (!orig) return;
      if (orig.position_x === desk.position_x && orig.position_y === desk.position_y) return;
      updateDeskPositionMutation.mutate({
        ...desk,
        position_x: desk.position_x,
        position_y: desk.position_y,
        ...(backendSupportsDeskRotation ? { rotation_deg: getRotation(desk.id) } : {})
      });
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Office map + right column (calendar, lists) */}
        <div className="grid gap-6 lg:grid-cols-[2.4fr_1.4fr] items-start">
          <div className="space-y-4 min-w-0">
            <Card className="opacity-0 animate-stagger-1">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="font-display font-bold">Office map</CardTitle>
                <CardDescription>
                  {editMode ? "Drag desks to reposition. Click Done when finished." : "Select a desk to reserve."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isAdmin && (
                  <>
                    {!editMode && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleEnterEditMode}
                      >
                        Enable edit
                      </Button>
                    )}
                    {editMode && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveLayout}
                          disabled={!hasLayoutChanges || updateDeskPositionMutation.isPending}
                        >
                          {updateDeskPositionMutation.isPending
                            ? "Saving…"
                            : hasLayoutChanges
                            ? "Save layout"
                            : "Layout saved"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleExitEditMode}
                        >
                          Exit edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => createDeskMutation.mutate()}
                          disabled={createDeskMutation.isPending}
                        >
                          {createDeskMutation.isPending ? "Adding…" : "Add desk"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setMapSettingsOpen(true)}
                        >
                          Map image
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSnapToGrid((s) => !s)}
                        >
                          Snap to grid {snapToGrid ? "ON" : "OFF"}
                        </Button>
                      </>
                    )}
                  </>
                )}
                {!editMode && (
                  <>
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
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="w-full aspect-[1] min-h-[880px] overflow-hidden">
                {editMode ? (
                  <>
                    {desksQuery.isLoading && <p className="text-sm text-muted-foreground p-4">Loading desks...</p>}
                    {currentDesksForEditor.length > 0 && (
                      <EditableDeskMap
                        desks={currentDesksForEditor}
                        snapToGrid={snapToGrid}
                        onPositionChange={handlePositionChange}
                        onDeskClick={handleDeskClickEdit}
                        selectedDeskId={editingDesk?.id ?? null}
                        backgroundImageUrl={officeMapImageUrl}
                        getRotationDeg={getRotationDegEditor}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {availabilityQuery.isLoading && <p className="text-sm text-muted-foreground p-4">Loading desks...</p>}
                    {availabilityQuery.data && availabilityQuery.data.length > 0 && (
                      <DeskMap
                        desks={availabilityQuery.data}
                        onSelectDesk={handleDeskClick}
                        backgroundImageUrl={officeMapImageUrl}
                        getRotationDeg={getRotationDegAvailability}
                      />
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          <div className="space-y-4 min-w-0 flex flex-col">
            {/* Calendar top-right */}
            <Card className="opacity-0 animate-stagger-1 rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-md shadow-glass">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="font-display font-bold text-sm">Current week</CardTitle>
                  <CardDescription>
                    {weekRangeLabel} · Your reservations
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-card/90 to-secondary/80 shadow-glow ring-1 ring-primary/10">
                  <CalendarView
                    events={events}
                    defaultDate={selectedDate}
                    onNavigate={(d) => setSelectedDate(d)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Find free desk */}
            <Card className="opacity-0 animate-stagger-2 rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-md shadow-glass">
              <CardHeader>
                <CardTitle className="font-display font-bold text-sm">Find free desk</CardTitle>
                <CardDescription>
                  Desks free on {selectedDate.toLocaleDateString()}. Click one on the map to reserve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityQuery.isLoading && (
                  <div className="text-xs text-muted-foreground">Loading…</div>
                )}
                {!availabilityQuery.isLoading && freeDesks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {freeDesks.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDesk(d);
                          setModalOpen(true);
                        }}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
                {!availabilityQuery.isLoading && freeDesks.length === 0 && availabilityQuery.data?.length !== 0 && (
                  <div className="text-xs text-muted-foreground">No free desks this day.</div>
                )}
                {!availabilityQuery.isLoading && availabilityQuery.data?.length === 0 && (
                  <div className="text-xs text-muted-foreground">No desks configured.</div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-md shadow-glass">
              <CardHeader>
                <CardTitle className="font-display font-bold text-sm">Next reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {reservationsQuery.isLoading && (
                    <div className="text-xs text-muted-foreground">Loading…</div>
                  )}
                  {!reservationsQuery.isLoading &&
                    (reservationsQuery.data?.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.04] bg-secondary/50 px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{r.desk_name} · {r.room}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(r.start_time).toLocaleString()} – {new Date(r.end_time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )) ?? null)}
                  {!reservationsQuery.isLoading && !reservationsQuery.data?.length && (
                    <div className="text-xs text-muted-foreground">No reservations yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
      <DeskEditorDialog
        open={deskEditorOpen}
        onOpenChange={setDeskEditorOpen}
        desk={editingDesk}
        onSave={(desk, name, room) => updateDeskDetailsMutation.mutate({ desk, name, room })}
        onDelete={(desk) => deleteDeskMutation.mutate(desk.id)}
        rotationDeg={editingDesk ? getRotation(editingDesk.id) : 0}
        onRotate={(desk, rotationDeg) => {
          // Update UI immediately (local) and persist in backend (cloud).
          setRotation(desk.id, rotationDeg);
          updateDeskRotationMutation.mutate({ deskId: desk.id, rotation_deg: rotationDeg });
        }}
        isSaving={updateDeskDetailsMutation.isPending}
        isDeleting={deleteDeskMutation.isPending}
      />
      <OfficeMapSettingsDialog
        open={mapSettingsOpen}
        onOpenChange={setMapSettingsOpen}
        value={officeMapImageUrl}
        onChange={(next) => setOfficeMapImageUrl(next)}
      />
    </MainLayout>
  );
}



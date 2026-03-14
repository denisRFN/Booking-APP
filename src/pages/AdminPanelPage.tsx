import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { Reservation } from "../types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function AdminPanelPage() {
  const queryClient = useQueryClient();

  const reservationsQuery = useQuery({
    queryKey: ["reservations-admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<Reservation[]>("/reservations", {
        params: { mine: false }
      });
      return data;
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
      <div className="max-w-3xl mx-auto">
        <Card className="opacity-0 animate-stagger-1">
          <CardHeader>
            <CardTitle className="font-display font-bold">All reservations</CardTitle>
            <CardDescription>View and manage all users&apos; bookings. Reposition desks from Dashboard with &quot;Enable edit&quot;.</CardDescription>
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

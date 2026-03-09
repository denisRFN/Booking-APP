import { useQuery } from "@tanstack/react-query";

import { MainLayout } from "../layouts/MainLayout";
import { apiClient } from "../services/apiClient";
import { Reservation } from "../types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function MyReservationsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Reservation[]>("/reservations", {
        params: { mine: true }
      });
      return data;
    }
  });

  const cancelReservation = async (id: number) => {
    await apiClient.delete(`/reservations/${id}`);
    refetch();
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>My reservations</CardTitle>
          <CardDescription>Manage your upcoming and past desk bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          <div className="space-y-3">
            {data?.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm shadow-subtle"
              >
                <div>
                  <div className="font-medium">
                    {r.desk_name} · {r.room}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.start_time).toLocaleString()} – {new Date(r.end_time).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => cancelReservation(r.id)}>
                  Cancel
                </Button>
              </div>
            ))}
            {!isLoading && !data?.length && (
              <p className="text-sm text-muted-foreground">No reservations yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}


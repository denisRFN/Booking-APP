export interface Desk {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  room: string;
}

export interface AvailabilityDesk {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  room: string;
  status: "available" | "occupied" | "mine";
  booked_by_name?: string | null;
  booked_by_email?: string | null;
  booked_from?: string | null;
  booked_to?: string | null;
}

export interface Reservation {
  id: number;
  user_id: number;
  desk_id: number;
  desk_name: string;
  room: string;
  start_time: string;
  end_time: string;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
}

export interface ReservationEvent {
  id: number;
  start: string;
  end: string;
  deskName: string;
  room: string;
}


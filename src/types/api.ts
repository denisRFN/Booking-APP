export interface AvailabilityDesk {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  room: string;
  status: "available" | "occupied" | "mine";
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
}

export interface ReservationEvent {
  id: number;
  start: string;
  end: string;
  deskName: string;
  room: string;
}


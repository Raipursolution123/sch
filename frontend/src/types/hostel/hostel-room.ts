export interface HostelRoom {
  id: number;
  hostel_id: number | null;
  room_type_id: number | null;
  room_no: string | null;
  no_of_bed: number | null;
  cost_per_bed: number | null;
  cost_term: string | null;
  title: string | null;
  fee_title: string | null;
  description: string | null;
  created_at?: string | null;
}

export interface CreateHostelRoomPayload {
  hostel_id?: number | null;
  room_type_id?: number | null;
  room_no: string;
  no_of_bed?: number | null;
  cost_per_bed?: number;
  cost_term?: string | null;
  title?: string | null;
  fee_title?: string | null;
  description?: string | null;
}

export type UpdateHostelRoomPayload = Partial<CreateHostelRoomPayload>;

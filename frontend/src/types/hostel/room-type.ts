export interface RoomType {
  id: number;
  room_type: string | null;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateRoomTypePayload {
  room_type: string;
  description?: string | null;
}

export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload>;

export interface TransportFeeMaster {
  id: number;
  session_id: number;
  month?: string | null;
  due_date?: string | null;
  fine_amount?: number | null;
  fine_type?: string | null;
  fine_percentage?: number | null;
  created_at: string;
}

export interface CreateTransportFeeMasterPayload {
  session_id: number;
  month?: string | null;
  due_date?: string | null;
  fine_amount?: number | null;
  fine_type?: string | null;
  fine_percentage?: number | null;
}

export type UpdateTransportFeeMasterPayload = Partial<CreateTransportFeeMasterPayload>;

export interface PickupPoint {
  id: number;
  name: string;
  latitude?: string | null;
  longitude?: string | null;
  created_at: string;
}

export interface CreatePickupPointPayload {
  name: string;
  latitude?: string | null;
  longitude?: string | null;
}

export type UpdatePickupPointPayload = Partial<CreatePickupPointPayload>;

export interface TransportRoute {
  id: number;
  route_title?: string | null;
  route_from?: string | null;
  route_to?: string | null;
  route_distance?: number | null;
  no_of_vehicle?: number | null;
  note?: string | null;
  is_active?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateTransportRoutePayload {
  route_title?: string | null;
  route_from?: string | null;
  route_to?: string | null;
  route_distance?: number | null;
  no_of_vehicle?: number | null;
  note?: string | null;
  is_active?: string | null;
}

export type UpdateTransportRoutePayload = Partial<CreateTransportRoutePayload>;

export interface Vehicle {
  id: number;
  vehicle_no?: string | null;
  vehicle_model?: string | null;
  vehicle_base_average?: number | null;
  vehicle_photo?: string | null;
  manufacture_year?: string | null;
  registration_number: string;
  chasis_number: string;
  max_seating_capacity: string;
  driver_name?: string | null;
  driver_licence?: string | null;
  driver_contact?: string | null;
  note?: string | null;
  created_at: string;
  swap_with?: string | null;
  swap_till?: string | null;
  swap_status?: number | null;
  swap_history?: string | null;
  v_name: string;
  v_color: string;
  v_group: string;
  v_api_url: string;
}

export interface CreateVehiclePayload {
  vehicle_no?: string | null;
  vehicle_model?: string | null;
  vehicle_base_average?: number | null;
  vehicle_photo?: string | null;
  manufacture_year?: string | null;
  registration_number: string;
  chasis_number: string;
  max_seating_capacity: string;
  driver_name?: string | null;
  driver_licence?: string | null;
  driver_contact?: string | null;
  note?: string | null;
  swap_with?: string | null;
  swap_till?: string | null;
  swap_status?: number | null;
  swap_history?: string | null;
  v_name: string;
  v_color: string;
  v_group: string;
  v_api_url: string;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface VehicleRouteAssignment {
  id: number;
  route_id: number;
  vehicle_id: number;
  created_at: string;
  // Enriched fields:
  route_title?: string;
  route_from?: string;
  route_to?: string;
  vehicle_no?: string;
  vehicle_model?: string;
  driver_name?: string;
}

export interface CreateVehicleRouteAssignmentPayload {
  route_id: number;
  vehicle_id: number;
}

export type UpdateVehicleRouteAssignmentPayload = Partial<CreateVehicleRouteAssignmentPayload>;





import { z } from 'zod';

export const vehicleRouteFormSchema = z.object({
  route_id: z.string().min(1, 'Route is required'),
  vehicle_id: z.string().min(1, 'Vehicle is required'),
});

export type VehicleRouteFormValues = z.infer<typeof vehicleRouteFormSchema>;

import { z } from 'zod';

export const routePickupPointFormSchema = z.object({
  transport_route_id: z.string().trim().min(1, 'Route is required'),
  pickup_point_id: z.string().trim().min(1, 'Pickup point is required'),
  fees: z.number().min(0).optional(),
  destination_distance: z.number().min(0).optional(),
  pickup_time: z.string().trim().optional(),
  order_number: z.string().trim().optional(),
});

export type RoutePickupPointFormValues = z.infer<typeof routePickupPointFormSchema>;

import { z } from 'zod';

const optionalNumber = z.string().refine((value) => value === '' || !Number.isNaN(Number(value)), {
  message: 'Enter a valid number',
});

export const transportRouteFormSchema = z.object({
  route_title: z.string().trim().min(1, 'Route title is required'),
  route_from: z.string().trim(),
  route_to: z.string().trim(),
  route_distance: optionalNumber,
  no_of_vehicle: optionalNumber,
  note: z.string().trim(),
  is_active: z.boolean(),
});

export type TransportRouteFormValues = z.infer<typeof transportRouteFormSchema>;

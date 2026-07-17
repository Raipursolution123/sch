import { z } from 'zod';

export const pickupPointFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  latitude: z.string().trim(),
  longitude: z.string().trim(),
});

export type PickupPointFormValues = z.infer<typeof pickupPointFormSchema>;

import { z } from 'zod';

export const vehicleFormSchema = z.object({
  registration_number: z.string().trim().min(1, 'Registration number is required'),
  chasis_number: z.string().trim().min(1, 'Chassis number is required'),
  max_seating_capacity: z
    .union([z.string(), z.number()])
    .transform((val) => String(val).trim())
    .refine((val) => val.length > 0, 'Seating capacity is required'),
  vehicle_no: z.string().trim().nullish(),
  driver_name: z.string().trim().nullish(),
  driver_contact: z.string().trim().nullish(),
  v_name: z.string().trim().nullish(),
  v_color: z.string().trim().nullish(),
  v_group: z.string().trim().nullish(),
  v_api_url: z.string().trim().nullish(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

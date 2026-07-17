import { z } from 'zod';

export const vehicleFormSchema = z.object({
  registration_number: z.string().trim().min(1, 'Registration number is required'),
  chasis_number: z.string().trim().min(1, 'Chassis number is required'),
  max_seating_capacity: z.string().trim().min(1, 'Seating capacity is required'),
  vehicle_no: z.string().trim(),
  driver_name: z.string().trim(),
  driver_contact: z.string().trim(),
  v_name: z.string().trim(),
  v_color: z.string().trim(),
  v_group: z.string().trim(),
  v_api_url: z.string().trim(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

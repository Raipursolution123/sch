import { z } from 'zod';

export const feeReminderFormSchema = z.object({
  day: z.number({ error: 'Day is required' }).int().min(0, 'Day cannot be negative'),
  is_active: z.boolean(),
});

export type FeeReminderFormValues = z.infer<typeof feeReminderFormSchema>;

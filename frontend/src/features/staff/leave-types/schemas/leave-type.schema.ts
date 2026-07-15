import { z } from 'zod';

export const leaveTypeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  is_active: z.boolean(),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>;

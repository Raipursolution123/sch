import { z } from 'zod';

export const feeGroupFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

export type FeeGroupFormValues = z.infer<typeof feeGroupFormSchema>;

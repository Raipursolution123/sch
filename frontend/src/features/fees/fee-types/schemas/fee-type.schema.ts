import { z } from 'zod';

export const feeTypeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(100, 'Code is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, hyphens, or underscores'),
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name is too long'),
  feecategory_id: z.number().min(1, 'Select a category'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

export type FeeTypeFormValues = z.infer<typeof feeTypeFormSchema>;

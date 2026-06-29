import { z } from 'zod';

export const classFormSchema = z.object({
  class_name: z.string().trim().min(1, 'Class name is required').max(60),
  sort_order: z.number({ error: 'Sort order must be a number' }).int('Sort order must be a whole number').min(0, 'Sort order cannot be negative'),
  is_hedu_program: z.boolean(),
  is_active: z.boolean(),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;

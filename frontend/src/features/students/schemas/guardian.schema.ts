import { z } from 'zod';

export const guardianFormSchema = z.object({
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
});

export type GuardianFormValues = z.infer<typeof guardianFormSchema>;

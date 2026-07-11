import { z } from 'zod';

export const disableStudentSchema = z.object({
  disable_reason_id: z.number().int().min(1, 'Select a disable reason'),
  dis_note: z.string().optional(),
});

export type DisableStudentFormValues = z.infer<typeof disableStudentSchema>;

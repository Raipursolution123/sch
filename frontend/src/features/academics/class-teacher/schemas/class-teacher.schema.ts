import { z } from 'zod';

export const classTeacherFormSchema = z.object({
  staff_id: z.coerce.number().int().positive('Select a teacher'),
});

export type ClassTeacherFormValues = z.infer<typeof classTeacherFormSchema>;

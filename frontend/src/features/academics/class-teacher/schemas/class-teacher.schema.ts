import { z } from 'zod';

export const classTeacherFormSchema = z.object({
  staff_id: z.number({ error: 'Select a teacher' }).int().positive('Select a teacher'),
});

export type ClassTeacherFormValues = z.infer<typeof classTeacherFormSchema>;

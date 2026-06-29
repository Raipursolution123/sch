import { z } from 'zod';

export const examGroupFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(250, 'Name is too long'),
  exam_type: z.string().min(1, 'Exam type is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

export type ExamGroupFormValues = z.infer<typeof examGroupFormSchema>;

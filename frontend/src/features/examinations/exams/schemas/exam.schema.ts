import { z } from 'zod';

export const examFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(250, 'Name is too long'),
  exam_group_id: z.number().min(1, 'Select an exam group'),
  session_id: z.number().min(1, 'Select a session'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  passing_percentage: z.number({ error: 'Enter a valid percentage' }).min(0).max(100).nullable(),
  is_published: z.boolean(),
  description: z.string().optional(),
  is_active: z.boolean(),
});

export type ExamFormValues = z.infer<typeof examFormSchema>;

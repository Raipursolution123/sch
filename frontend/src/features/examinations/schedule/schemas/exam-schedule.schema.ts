import { z } from 'zod';

export const examScheduleFormSchema = z.object({
  exam_id: z.number().min(1, 'Select an exam'),
  subject_id: z.number().min(1, 'Select a subject'),
  session_id: z.number().min(1, 'Select a session'),
  date_of_exam: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  room_no: z.string().optional(),
  full_marks: z.number({ error: 'Enter valid marks' }).int().min(1).nullable(),
  passing_marks: z.number({ error: 'Enter valid marks' }).int().min(0).nullable(),
  note: z.string().optional(),
  is_active: z.boolean(),
});

export type ExamScheduleFormValues = z.infer<typeof examScheduleFormSchema>;

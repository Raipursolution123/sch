import { z } from 'zod';

export const homeworkFormSchema = z.object({
  class_id: z.number({ error: 'Select a class' }).int().positive('Select a class'),
  section_id: z.number({ error: 'Select a section' }).int().positive('Select a section'),
  session_id: z.number({ error: 'Session is required' }).int().positive('Session is required'),
  staff_id: z.number({ error: 'Select a teacher' }).int().positive('Select a teacher'),
  subject_id: z.number().int().positive().nullable().optional(),
  homework_date: z.string().min(1, 'Homework date is required'),
  submit_date: z.string().min(1, 'Submit date is required'),
  marks: z.number().nullable().optional(),
  description: z.string().optional(),
});

export type HomeworkFormValues = z.infer<typeof homeworkFormSchema>;

export const dailyAssignmentFormSchema = z.object({
  student_session_id: z
    .number({ error: 'Student session ID is required' })
    .int()
    .positive('Student session ID is required'),
  subject_group_subject_id: z
    .number({ error: 'Subject group subject ID is required' })
    .int()
    .positive('Subject group subject ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  remark: z.string().min(1, 'Remark is required'),
  evaluated_by: z.number().int().positive().nullable().optional(),
});

export type DailyAssignmentFormValues = z.infer<typeof dailyAssignmentFormSchema>;

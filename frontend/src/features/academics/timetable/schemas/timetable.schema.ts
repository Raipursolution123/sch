import { z } from 'zod';
import { TIMETABLE_DAYS } from '@app-types/academics/timetable';

const days = [...TIMETABLE_DAYS] as [string, ...string[]];

export const timetablePeriodSchema = z.object({
  subject_group_subject_id: z
    .number({ error: 'Select a subject' })
    .int()
    .positive('Select a subject'),
  staff_id: z.number({ error: 'Select a teacher' }).int().positive('Select a teacher'),
  day: z.enum(days, { error: 'Select a day' }),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  room_no: z.string().trim().max(20).optional(),
});

export type TimetablePeriodFormValues = z.infer<typeof timetablePeriodSchema>;

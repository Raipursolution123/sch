import { z } from 'zod';

export const subjectGroupDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required').max(250),
  description: z.string().trim().max(2000).optional(),
  session_id: z.number({ error: 'Select a session' }).int().positive('Select a session'),
});

export type SubjectGroupDetailsValues = z.infer<typeof subjectGroupDetailsSchema>;

export const subjectGroupAssignmentsSchema = z.object({
  subject_ids: z.array(z.number().int().positive()),
  class_section_ids: z.array(z.number().int().positive()),
});

export type SubjectGroupAssignmentsValues = z.infer<typeof subjectGroupAssignmentsSchema>;

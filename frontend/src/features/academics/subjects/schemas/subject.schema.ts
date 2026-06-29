import { z } from 'zod';
import { SUBJECT_TYPE_OPTIONS } from '@features/academics/subjects/constants/options';

const subjectTypes = SUBJECT_TYPE_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const subjectFormSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  code: z
    .string()
    .trim()
    .min(1, 'Subject code is required')
    .max(100)
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, hyphen, or underscore'),
  type: z.enum(subjectTypes, { error: 'Select a subject type' }),
  linked_class_ids: z.array(z.number().int().positive()),
  is_active: z.boolean(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;

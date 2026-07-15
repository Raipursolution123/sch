import { z } from 'zod';

export const gradeFormSchema = z
  .object({
    exam_type: z.string().trim().min(1, 'Exam type is required'),
    name: z.string().trim().min(1, 'Name is required'),
    point: z.number({ error: 'Point is required' }),
    mark_from: z.number({ error: 'Mark from is required' }),
    mark_upto: z.number({ error: 'Mark upto is required' }),
    description: z.string().optional(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.mark_from > values.mark_upto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mark from cannot be greater than mark upto',
        path: ['mark_from'],
      });
    }
  });

export type GradeFormValues = z.infer<typeof gradeFormSchema>;

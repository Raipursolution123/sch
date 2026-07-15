import { z } from 'zod';

export const markDivisionFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    percentage_from: z.number({ error: 'Percentage from is required' }),
    percentage_to: z.number({ error: 'Percentage to is required' }),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.percentage_from > values.percentage_to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage from cannot be greater than percentage to',
        path: ['percentage_from'],
      });
    }
    if (values.percentage_from < 0 || values.percentage_to > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage range must be between 0 and 100',
        path: values.percentage_from < 0 ? ['percentage_from'] : ['percentage_to'],
      });
    }
  });

export type MarkDivisionFormValues = z.infer<typeof markDivisionFormSchema>;

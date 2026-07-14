import { z } from 'zod';

export const feeDiscountFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    code: z.string().trim().min(1, 'Code is required'),
    session_id: z.number().min(1, 'Select a session'),
    type: z.enum(['percentage', 'fixed']),
    percentage: z.number().nullable(),
    amount: z.number().nullable(),
    description: z.string().optional(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'percentage') {
      if (values.percentage == null || Number.isNaN(values.percentage)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percentage is required',
          path: ['percentage'],
        });
      } else if (values.percentage <= 0 || values.percentage > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Percentage must be between 0 and 100',
          path: ['percentage'],
        });
      }
      return;
    }

    if (values.amount == null || Number.isNaN(values.amount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount is required',
        path: ['amount'],
      });
    } else if (values.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be greater than zero',
        path: ['amount'],
      });
    }
  });

export type FeeDiscountFormValues = z.infer<typeof feeDiscountFormSchema>;

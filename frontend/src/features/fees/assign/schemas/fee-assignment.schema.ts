import { z } from 'zod';

export const feeAssignmentLineSchema = z.object({
  feetype_id: z.number().min(1, 'Select a fee type'),
  amount: z.number({ error: 'Enter a valid amount' }).min(0.01, 'Amount must be greater than zero'),
  due_date: z.string().optional(),
});

export const feeAssignmentFormSchema = z.object({
  class_id: z.number().min(1, 'Select a class'),
  fee_group_id: z.number().min(1, 'Select a fee group'),
  session_id: z.number().min(1, 'Select a session'),
  lines: z.array(feeAssignmentLineSchema).min(1, 'Add at least one fee line'),
  is_active: z.boolean(),
});

export type FeeAssignmentFormValues = z.infer<typeof feeAssignmentFormSchema>;
export type FeeAssignmentLineFormValues = z.infer<typeof feeAssignmentLineSchema>;

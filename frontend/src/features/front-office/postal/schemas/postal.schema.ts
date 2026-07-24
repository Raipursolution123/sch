import { z } from 'zod';

export const postalFormSchema = z.object({
  reference_no: z.string().trim().min(1, 'Reference number is required'),
  to_title: z.string().trim().min(1, 'To title is required'),
  from_title: z.string().trim().optional(),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
  date: z.string().trim().optional(),
});

export type PostalFormValues = z.infer<typeof postalFormSchema>;

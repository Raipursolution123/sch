import { z } from 'zod';

export const complaintFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  complaint_type: z.string().trim().optional(),
  source: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  email: z.string().trim().optional(),
  date: z.string().trim().min(1, 'Date is required'),
  description: z.string().trim().optional(),
  action_taken: z.string().trim().optional(),
  assigned: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

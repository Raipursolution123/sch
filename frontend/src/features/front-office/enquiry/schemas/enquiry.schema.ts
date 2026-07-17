import { z } from 'zod';

export const enquiryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  contact: z.string().trim().min(1, 'Contact is required'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  source: z.string().trim().optional(),
  status: z.string().trim().min(1, 'Status is required'),
  date: z.string().trim().min(1, 'Date is required'),
  follow_up_date: z.string().trim().min(1, 'Follow-up date is required'),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

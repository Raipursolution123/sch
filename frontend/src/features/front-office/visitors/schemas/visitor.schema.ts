import { z } from 'zod';

export const visitorFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  contact: z.string().trim().min(1, 'Contact is required'),
  purpose: z.string().trim().min(1, 'Purpose is required'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  source: z.string().trim().optional(),
  id_proof: z.string().trim().optional(),
  no_of_people: z.number().int().min(1).optional(),
  date: z.string().trim().min(1, 'Date is required'),
  in_time: z.string().trim().optional(),
  out_time: z.string().trim().optional(),
  meeting_with: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export type VisitorFormValues = z.infer<typeof visitorFormSchema>;

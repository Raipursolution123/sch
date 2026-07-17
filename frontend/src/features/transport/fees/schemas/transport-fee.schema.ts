import { z } from 'zod';

const optionalNumber = z.string().refine((value) => value === '' || !Number.isNaN(Number(value)), {
  message: 'Enter a valid number',
});

export const transportFeeFormSchema = z.object({
  session_id: z.string().min(1, 'Session is required'),
  month: z.string().trim(),
  due_date: z.string(),
  fine_amount: optionalNumber,
  fine_type: z.string().trim(),
  fine_percentage: optionalNumber,
});

export type TransportFeeFormValues = z.infer<typeof transportFeeFormSchema>;

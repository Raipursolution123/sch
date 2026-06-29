import { z } from 'zod';

export const currencyFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  short_name: z
    .string()
    .trim()
    .min(3, 'Short name must be 3 characters')
    .max(10, 'Short name is too long')
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter ISO code (e.g. INR)'),
  symbol: z.string().trim().min(1, 'Symbol is required').max(10),
  base_price: z
    .string()
    .trim()
    .min(1, 'Base price is required')
    .regex(/^\d+(\.\d{1,4})?$/, 'Enter a valid number (e.g. 1 or 83.25)'),
  is_active: z.boolean(),
});

export type CurrencyFormValues = z.infer<typeof currencyFormSchema>;

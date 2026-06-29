import { z } from 'zod';

export const languageFormSchema = z.object({
  language: z.string().trim().min(1, 'Language name is required').max(50),
  short_code: z
    .string()
    .trim()
    .min(2, 'Short code must be at least 2 characters')
    .max(10, 'Short code is too long')
    .regex(/^[a-zA-Z]+$/, 'Use letters only (e.g. en)'),
  country_code: z
    .string()
    .trim()
    .min(2, 'Country code must be at least 2 characters')
    .max(10, 'Country code is too long')
    .regex(/^[a-zA-Z]+$/, 'Use letters only (e.g. us)'),
  is_rtl: z.boolean(),
  is_active: z.boolean(),
});

export type LanguageFormValues = z.infer<typeof languageFormSchema>;

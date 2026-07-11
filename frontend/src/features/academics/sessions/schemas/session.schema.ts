import { z } from 'zod';
import { isValidSessionName } from '@utils/session';

export const sessionFormSchema = z.object({
  session: z
    .string()
    .trim()
    .min(1, 'Session name is required')
    .refine(isValidSessionName, 'Use consecutive years in YYYY-YY format (e.g. 2026-27)'),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

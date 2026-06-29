import { z } from 'zod';

export const classSectionFormSchema = z.object({
  class_id: z.number({ error: 'Select a class' }).int().positive('Select a class'),
  section_id: z.number({ error: 'Select a section' }).int().positive('Select a section'),
  is_active: z.boolean(),
});

export type ClassSectionFormValues = z.infer<typeof classSectionFormSchema>;

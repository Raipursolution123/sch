import { z } from 'zod';

export const sectionFormSchema = z.object({
  section_name: z.string().trim().min(1, 'Section name is required').max(60),
  is_active: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

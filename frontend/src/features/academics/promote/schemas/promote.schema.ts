import { z } from 'zod';

export const promoteSourceSchema = z.object({
  from_session_id: z.coerce.number().int().positive(),
  from_class_id: z.coerce.number().int().positive(),
  from_section_id: z.coerce.number().int().positive(),
});

export const promoteTargetSchema = z.object({
  to_session_id: z.coerce.number().int().positive(),
  to_class_id: z.coerce.number().int().positive(),
  to_section_id: z.coerce.number().int().positive(),
  to_subject_group_id: z.coerce.number().int().positive().nullable().optional(),
});

export type PromoteSourceValues = z.infer<typeof promoteSourceSchema>;
export type PromoteTargetValues = z.infer<typeof promoteTargetSchema>;

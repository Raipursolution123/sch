import { z } from 'zod';
import { GENDER_OPTIONS } from '@features/students/constants/options';

const genderValues = GENDER_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const studentAdmissionSchema = z.object({
  admission_no: z.string().trim().min(1, 'Admission number is required').max(100),
  admission_date: z.string().min(1, 'Admission date is required'),
  firstname: z.string().trim().min(1, 'First name is required').max(100),
  middlename: z.string().trim().max(255).optional().or(z.literal('')),
  lastname: z.string().trim().min(1, 'Last name is required').max(100),
  gender: z.enum(genderValues, { error: 'Select gender' }),
  dob: z.string().min(1, 'Date of birth is required'),
  class_id: z.number({ error: 'Select a class' }).int().positive('Select a class'),
  section_id: z.number({ error: 'Select a section' }).int().positive('Select a section'),
  roll_no: z.string().trim().optional().or(z.literal('')),
  mobileno: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^\d{10}$/.test(v), 'Enter a valid 10-digit mobile number'),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Enter a valid email'),
  father_name: z.string().trim().max(100).optional().or(z.literal('')),
  mother_name: z.string().trim().max(100).optional().or(z.literal('')),
  guardian_phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^\d{10}$/.test(v), 'Enter a valid 10-digit phone number'),
  current_address: z.string().trim().max(500).optional().or(z.literal('')),
  blood_group: z.string().trim().optional().or(z.literal('')),
  religion: z.string().trim().max(100).optional().or(z.literal('')),
  category_id: z.string().trim().optional().or(z.literal('')),
  rte: z.string().trim().min(1, 'Select RTE status'),
  is_active: z.boolean(),
});

export type StudentAdmissionFormValues = z.infer<typeof studentAdmissionSchema>;

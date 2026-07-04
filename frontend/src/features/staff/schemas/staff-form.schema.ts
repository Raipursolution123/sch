import { z } from 'zod';

export const staffFormSchema = z.object({
  employee_id: z.string().trim().min(1, 'Employee ID is required'),
  name: z.string().trim().min(1, 'First name is required'),
  surname: z.string().trim().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Gender is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().trim().email('Enter a valid email'),
  contact_no: z.string().trim().min(1, 'Contact number is required'),
  emergency_contact_no: z.string().trim().min(1, 'Emergency contact is required'),
  department_id: z.number().optional(),
  designation_id: z.number().optional(),
  qualification: z.string().trim().min(1, 'Qualification is required'),
  work_exp: z.string().trim().min(1, 'Work experience is required'),
  date_of_joining: z.string().optional(),
  date_of_leaving: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  local_address: z.string().trim().min(1, 'Local address is required'),
  permanent_address: z.string().trim().min(1, 'Permanent address is required'),
  marital_status: z.string().min(1, 'Marital status is required'),
  contract_type: z.string().min(1, 'Contract type is required'),
  basic_salary: z.coerce.number().nullable().optional(),
  is_active: z.boolean(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

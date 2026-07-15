import { z } from 'zod';

export const staffLeaveRequestFormSchema = z.object({
  staff_id: z.number({ error: 'Select a staff member' }).min(1, 'Select a staff member'),
  leave_type_id: z.number({ error: 'Select a leave type' }).min(1, 'Select a leave type'),
  leave_from: z.string().trim().min(1, 'Leave from is required'),
  leave_to: z.string().trim().min(1, 'Leave to is required'),
  employee_remark: z.string().optional(),
});

export type StaffLeaveRequestFormValues = z.infer<typeof staffLeaveRequestFormSchema>;

export const reviewLeaveFormSchema = z.object({
  admin_remark: z.string().optional(),
});

export type ReviewLeaveFormValues = z.infer<typeof reviewLeaveFormSchema>;

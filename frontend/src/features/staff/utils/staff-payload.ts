import type { ActiveFlag } from '@app-types/settings/session';
import type { CreateStaffPayload, StaffDetail } from '@app-types/staff/staff';
import type { StaffFormValues } from '@features/staff/schemas/staff-form.schema';

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function staffToFormValues(staff: StaffDetail): StaffFormValues {
  return {
    employee_id: staff.employee_id,
    name: staff.name,
    surname: staff.surname,
    gender: staff.gender,
    dob: staff.dob,
    email: staff.email,
    contact_no: staff.contact_no,
    emergency_contact_no: staff.emergency_contact_no,
    department_id: staff.department_id,
    designation_id: staff.designation_id,
    qualification: staff.qualification,
    work_exp: staff.work_exp,
    date_of_joining: staff.date_of_joining ?? '',
    father_name: staff.father_name ?? '',
    mother_name: staff.mother_name ?? '',
    local_address: staff.local_address,
    marital_status: staff.marital_status,
    contract_type: staff.contract_type,
    is_active: staff.is_active === 'yes',
  };
}

export function toStaffPayload(values: StaffFormValues): CreateStaffPayload {
  const joining = values.date_of_joining?.trim();
  return {
    employee_id: values.employee_id.trim(),
    name: values.name.trim(),
    surname: values.surname.trim(),
    gender: values.gender,
    dob: values.dob,
    email: values.email.trim(),
    contact_no: values.contact_no.trim(),
    emergency_contact_no: values.emergency_contact_no.trim(),
    department_id: values.department_id,
    designation_id: values.designation_id,
    qualification: values.qualification.trim(),
    work_exp: values.work_exp.trim(),
    date_of_joining: joining ? joining : null,
    father_name: emptyToNull(values.father_name),
    mother_name: emptyToNull(values.mother_name),
    local_address: values.local_address.trim(),
    marital_status: values.marital_status,
    contract_type: values.contract_type,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

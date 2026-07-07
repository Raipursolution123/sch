import type { ActiveFlag } from '@app-types/settings/session';
import type { CreateStudentPayload, StudentDetail } from '@app-types/students/student';
import type { StudentAdmissionFormValues } from '@features/students/schemas/student-admission.schema';
import { todayIsoDate } from '@utils/student';

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function studentToFormValues(student: StudentDetail): StudentAdmissionFormValues {
  return {
    admission_no: student.admission_no,
    admission_date: student.admission_date ?? todayIsoDate(),
    firstname: student.firstname,
    middlename: student.middlename ?? '',
    lastname: student.lastname ?? '',
    gender: student.gender ?? 'Male',
    dob: student.dob ?? '',
    class_id: student.class_id ?? 0,
    section_id: student.section_id ?? 0,
    roll_no: student.roll_no != null ? String(student.roll_no) : '',
    mobileno: student.mobileno ?? '',
    email: student.email ?? '',
    father_name: student.father_name ?? '',
    mother_name: student.mother_name ?? '',
    guardian_name: student.guardian_name ?? '',
    guardian_phone: student.guardian_phone ?? '',
    current_address: student.current_address ?? '',
    blood_group: student.blood_group ?? '',
    religion: student.religion ?? '',
    category_id: student.category_id ?? 'General',
    rte: student.rte ?? 'No',
    is_active: student.is_active === 'yes',
  };
}

export function toStudentPayload(values: StudentAdmissionFormValues): CreateStudentPayload {
  const rollNo = values.roll_no?.trim();
  return {
    admission_no: values.admission_no.trim(),
    admission_date: values.admission_date,
    firstname: values.firstname,
    middlename: emptyToNull(values.middlename),
    lastname: values.lastname,
    gender: values.gender,
    dob: values.dob,
    class_id: values.class_id,
    section_id: values.section_id,
    roll_no: rollNo && !Number.isNaN(Number(rollNo)) ? Number(rollNo) : null,
    mobileno: emptyToNull(values.mobileno),
    email: emptyToNull(values.email),
    father_name: emptyToNull(values.father_name),
    mother_name: emptyToNull(values.mother_name),
    guardian_name: emptyToNull(values.guardian_name),
    guardian_phone: emptyToNull(values.guardian_phone),
    current_address: emptyToNull(values.current_address),
    blood_group: emptyToNull(values.blood_group),
    religion: emptyToNull(values.religion),
    category_id: emptyToNull(values.category_id),
    rte: values.rte,
    is_active: (values.is_active ? 'yes' : 'no') as ActiveFlag,
  };
}

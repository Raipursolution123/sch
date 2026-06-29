import type { StudentDetail } from '@app-types/students/student';
import type { GuardianFormValues } from '@features/students/schemas/guardian.schema';
import { studentToFormValues, toStudentPayload } from '@features/students/utils/student-payload';

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function studentToGuardianFormValues(student: StudentDetail): GuardianFormValues {
  return {
    father_name: student.father_name ?? '',
    mother_name: student.mother_name ?? '',
    guardian_name: student.guardian_name ?? '',
    guardian_phone: student.guardian_phone ?? '',
  };
}

export function mergeGuardianIntoStudentPayload(
  student: StudentDetail,
  guardian: GuardianFormValues,
) {
  const base = toStudentPayload(studentToFormValues(student));
  return {
    ...base,
    father_name: emptyToNull(guardian.father_name),
    mother_name: emptyToNull(guardian.mother_name),
    guardian_name: resolveGuardianName(guardian),
    guardian_phone: emptyToNull(guardian.guardian_phone),
  };
}

/** Payload fields used by mock update to set guardian_name. */
export function resolveGuardianName(guardian: GuardianFormValues): string | null {
  return (
    emptyToNull(guardian.guardian_name) ||
    emptyToNull(guardian.father_name) ||
    emptyToNull(guardian.mother_name)
  );
}

import type { StudentListItem } from '@app-types/students/student';

export function formatStudentName(
  firstname: string,
  middlename?: string | null,
  lastname?: string | null,
): string {
  return [firstname, middlename, lastname].filter(Boolean).join(' ').trim();
}

export function formatClassSection(
  className: string | null,
  sectionName: string | null,
): string {
  if (!className && !sectionName) return '—';
  if (!sectionName) return className ?? '—';
  if (!className) return sectionName;
  return `${className} — ${sectionName}`;
}

export function formatGender(gender: string | null): string {
  if (!gender) return '—';
  const normalized = gender.toLowerCase();
  if (normalized === 'male' || normalized === 'm') return 'Male';
  if (normalized === 'female' || normalized === 'f') return 'Female';
  return gender;
}

export function getStudentInitials(student: Pick<StudentListItem, 'full_name'>): string {
  const parts = student.full_name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

/** Suggest next admission number, e.g. ADM-2026-006 */
export function suggestAdmissionNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `ADM-${year}-`;
  const sequence = existingNumbers
    .filter((no) => no.toUpperCase().startsWith(prefix))
    .map((no) => Number(no.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n));
  const next = sequence.length > 0 ? Math.max(...sequence) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

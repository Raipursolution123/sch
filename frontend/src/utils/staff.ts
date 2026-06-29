import type { StaffListItem } from '@app-types/staff/staff';

export function formatStaffName(name: string, surname: string): string {
  return [name, surname].filter(Boolean).join(' ').trim();
}

export function getStaffInitials(staff: Pick<StaffListItem, 'name' | 'surname'>): string {
  const first = staff.name.trim().charAt(0).toUpperCase();
  const last = staff.surname.trim().charAt(0).toUpperCase();
  return `${first}${last}` || '?';
}

export function suggestEmployeeId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;
  const numbers = existingIds
    .filter((id) => id.toUpperCase().startsWith(prefix))
    .map((id) => {
      const match = id.match(/(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function formatDepartmentDesignation(
  department: string | null | undefined,
  designation: string | null | undefined,
): string {
  if (department && designation) return `${department} · ${designation}`;
  return department ?? designation ?? '—';
}

export function staffActiveFlag(isActive: boolean): StaffListItem['is_active'] {
  return isActive ? 'yes' : 'no';
}

export function isStaffActive(isActive: StaffListItem['is_active']): boolean {
  return isActive === 'yes';
}

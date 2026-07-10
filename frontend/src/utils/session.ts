import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@app-types/api';
import { formatDate } from '@utils/format';

/** Indian academic session label, e.g. "2026-27" (April–March). */
export function currentIndianAcademicSession(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 4 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, '0')}`;
}

/** Validates session name format YYYY-YY with consecutive academic years (e.g. 2026-27). */
export function isValidSessionName(value: string): boolean {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (!match) return false;

  const startYear = Number(match[1]);
  const endYearSuffix = Number(match[2]);
  const endYear = Number(
    `${String(startYear).slice(0, 2)}${String(endYearSuffix).padStart(2, '0')}`,
  );

  return endYear - startYear === 1;
}

export function formatSessionDate(iso: string | null): string {
  return formatDate(iso);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.isAxiosError && axiosError.response?.data?.error?.message) {
    return axiosError.response.data.error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

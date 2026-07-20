import { describe, expect, it } from 'vitest';
import { isValidSessionName, currentIndianAcademicSession } from './session';

describe('isValidSessionName', () => {
  it('accepts consecutive academic years', () => {
    expect(isValidSessionName('2025-26')).toBe(true);
    expect(isValidSessionName('2026-27')).toBe(true);
  });

  it('rejects non-consecutive years', () => {
    expect(isValidSessionName('2025-27')).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(isValidSessionName('2025/26')).toBe(false);
  });
});

describe('currentIndianAcademicSession', () => {
  it('uses next calendar year after April', () => {
    expect(currentIndianAcademicSession(new Date('2026-05-01'))).toBe('2026-27');
  });

  it('uses previous year before April', () => {
    expect(currentIndianAcademicSession(new Date('2026-02-01'))).toBe('2025-26');
  });
});

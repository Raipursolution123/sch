import type { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, formatErrorForLog } from './error-message';

describe('getApiErrorMessage', () => {
  it('returns fallback for unknown errors', () => {
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('extracts API error envelope message', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: { success: false, error: { message: 'Validation failed' } },
      },
    } as AxiosError;
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Validation failed');
  });

  it('handles network errors', () => {
    const error = {
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    } as AxiosError;
    expect(getApiErrorMessage(error, 'Fallback')).toContain('Network error');
  });
});

describe('formatErrorForLog', () => {
  it('returns message from axios error', () => {
    const error = {
      isAxiosError: true,
      name: 'AxiosError',
      response: { status: 403, data: { error: { message: 'Forbidden' } } },
      config: { method: 'get', url: '/api/v1/students/' },
    } as AxiosError;
    expect(formatErrorForLog(error)).toBe('Forbidden');
  });
});

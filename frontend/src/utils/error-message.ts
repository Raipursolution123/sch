import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@app-types/api';

type ErrorPayload = Record<string, unknown>;

function isRecord(value: unknown): value is ErrorPayload {
  return typeof value === 'object' && value !== null;
}

function formatValidationDetails(details: unknown): string | undefined {
  if (typeof details === 'string' && details.trim()) return details.trim();
  if (Array.isArray(details)) {
    const messages = details
      .map((item) => (typeof item === 'string' ? item : undefined))
      .filter(Boolean);
    if (messages.length) return messages.join(', ');
  }
  if (!isRecord(details)) return undefined;

  const parts: string[] = [];
  for (const [field, value] of Object.entries(details)) {
    if (field === 'message' || field === 'detail' || field === 'code') continue;
    if (typeof value === 'string' && value.trim()) {
      parts.push(`${field}: ${value}`);
      continue;
    }
    if (Array.isArray(value)) {
      const nested = value.filter(
        (item): item is string => typeof item === 'string' && !!item.trim(),
      );
      if (nested.length) parts.push(`${field}: ${nested.join(', ')}`);
    }
  }
  return parts.length ? parts.join('; ') : undefined;
}

function extractResponseMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;

  const apiError = data.error;
  if (isRecord(apiError)) {
    if (typeof apiError.message === 'string' && apiError.message.trim()) {
      return apiError.message.trim();
    }
    const fromDetails = formatValidationDetails(apiError.details);
    if (fromDetails) return fromDetails;
  }

  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
  if (Array.isArray(data.detail)) {
    const detailMessages = data.detail.filter(
      (item): item is string => typeof item === 'string' && !!item.trim(),
    );
    if (detailMessages.length) return detailMessages.join(', ');
  }

  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();

  return formatValidationDetails(data);
}

/** Human-readable message for API, Axios, and generic errors. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'string' && error.trim()) return error.trim();

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError?.isAxiosError) {
    const fromBody = extractResponseMessage(axiosError.response?.data);
    if (fromBody) return fromBody;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const statusText = axiosError.response.statusText?.trim();
      if (statusText) return `${status} ${statusText}`;
      if (status) return `Request failed with status ${status}`;
    }

    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error — check that the API server is running and reachable.';
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    if (axiosError.message && axiosError.message !== 'Network Error') {
      return axiosError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message.trim();

  const fromObject = extractResponseMessage(error);
  if (fromObject) return fromObject;

  return fallback;
}

/** Stable string for logs (Axios errors otherwise print as `{}`). */
export function formatErrorForLog(error: unknown): string {
  const message = getApiErrorMessage(error, '');
  if (message) return message;

  const axiosError = error as AxiosError;
  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status;
    const method = axiosError.config?.method?.toUpperCase();
    const url = axiosError.config?.url;
    const parts = [
      axiosError.name || 'AxiosError',
      status ? `status=${status}` : undefined,
      method && url ? `${method} ${url}` : url,
      axiosError.code,
    ].filter(Boolean);
    if (parts.length) return parts.join(' ');
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

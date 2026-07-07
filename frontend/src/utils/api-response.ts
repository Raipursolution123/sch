/** Loose backend payload shapes (DRF paginated, nested entity keys, API wrappers). */
export type BackendPayload = Record<string, unknown>;

function pick(obj: unknown, ...keys: string[]): unknown {
  let current: unknown = obj;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as BackendPayload)[key];
  }
  return current;
}

/** Extract a list from varied backend response shapes. */
export function extractList<T>(data: BackendPayload | undefined, entityKey?: string): T[] {
  if (!data) return [];

  const candidates: unknown[] = [];
  if (entityKey) {
    candidates.push(
      pick(data, 'results', entityKey),
      pick(data, 'data', entityKey),
      data[entityKey],
    );
  }
  candidates.push(pick(data, 'results'), pick(data, 'data'), pick(data, 'data', 'results'));

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return [];
}

export function extractCount(data: BackendPayload | undefined, fallback: number): number {
  if (!data) return fallback;
  if (typeof data.count === 'number') return data.count;
  const nested = data.data;
  if (
    nested &&
    typeof nested === 'object' &&
    typeof (nested as BackendPayload).count === 'number'
  ) {
    return (nested as BackendPayload).count as number;
  }
  return fallback;
}

export function extractEntity<T>(data: BackendPayload | undefined, entityKey?: string): T {
  if (!data) return data as T;
  if (entityKey) {
    const fromData = pick(data, 'data', entityKey);
    if (fromData !== undefined) return fromData as T;
    const direct = data[entityKey];
    if (direct !== undefined) return direct as T;
  }
  const nested = data.data;
  if (nested !== undefined) return nested as T;
  return data as T;
}

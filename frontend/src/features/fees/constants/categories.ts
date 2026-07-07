import type { FeeCategory } from '@app-types/fees/fee-type';

/** Mock fee categories until backend exposes lookup endpoints. */
export const FEE_CATEGORIES: FeeCategory[] = [
  { id: 1, name: 'Tuition', is_active: 'yes', created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Transport', is_active: 'yes', created_at: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Hostel', is_active: 'yes', created_at: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Miscellaneous', is_active: 'yes', created_at: '2024-01-01T00:00:00Z' },
];

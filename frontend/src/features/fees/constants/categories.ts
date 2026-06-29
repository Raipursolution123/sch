import type { FeeCategory } from '@app-types/fees/fee-type';

/** Mock fee categories until backend exposes lookup endpoints. */
export const FEE_CATEGORIES: FeeCategory[] = [
  { id: 1, name: 'Tuition' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Hostel' },
  { id: 4, name: 'Miscellaneous' },
];

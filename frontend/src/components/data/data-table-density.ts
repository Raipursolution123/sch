import type { DataTableDensity } from '@components/data/data-table-types';

export const DENSITY_STORAGE_KEY = 'school_erp_table_density';

export function readStoredDensity(): DataTableDensity {
  if (typeof window === 'undefined') return 'compact';
  const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return stored === 'comfortable' ? 'comfortable' : 'compact';
}

export function storeDensity(density: DataTableDensity) {
  window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
}

/** Shared horizontal padding — must match on th and td for column alignment. */
export const densityInlineClass: Record<DataTableDensity, string> = {
  compact: 'px-3',
  comfortable: 'px-4',
};

/** Shared vertical rhythm for header cells. */
export const densityHeadRowClass: Record<DataTableDensity, string> = {
  compact: 'h-9 py-0',
  comfortable: 'h-11 py-0',
};

/** Shared vertical rhythm for body cells. */
export const densityBodyRowClass: Record<DataTableDensity, string> = {
  compact: 'py-2',
  comfortable: 'py-3',
};

/** @deprecated Use densityInlineClass + densityHeadRowClass in layout helpers */
export const densityHeadClass: Record<DataTableDensity, string> = {
  compact: `${densityInlineClass.compact} ${densityHeadRowClass.compact} text-sm`,
  comfortable: `${densityInlineClass.comfortable} ${densityHeadRowClass.comfortable} text-sm`,
};

/** @deprecated Use densityInlineClass + densityBodyRowClass in layout helpers */
export const densityCellClass: Record<DataTableDensity, string> = {
  compact: `${densityInlineClass.compact} ${densityBodyRowClass.compact}`,
  comfortable: `${densityInlineClass.comfortable} ${densityBodyRowClass.comfortable}`,
};
